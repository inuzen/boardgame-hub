import { AVATARS, AvalonPlayer, ROLE_LIST } from './types';
import { Namespace, Server, Socket } from 'socket.io';
import { shuffle } from '../../utils/utils';
import {
    AvalonLokiRoom,
    addPlayerToRoom,
    addRoom,
    assassinateLoki,
    assignRolesLoki,
    clearVotesLoki,
    getActiveQuestLoki,
    getRoomByCode,
    handleGlobalVoteLoki,
    handleQuestVoteLoki,
    initQuestsLoki,
    nominatePlayerLoki,
    startNewVoteCycleLoki,
    updatePlayerLoki,
} from './AvalonLokiActions';
import { v4 as uuidv4 } from 'uuid';
import { Avalon, db } from '../../config/lokiDB';

class AvalonConnection {
    socket: Socket;
    ns: Namespace;
    roomCode: string;

    constructor(ns: Namespace, socket: Socket) {
        this.socket = socket;
        this.ns = ns;
        this.roomCode = '';

        socket.on('disconnect', () => this.disconnectLoki());
        socket.on('disconnecting', () => this.disconnectingLoki());
        socket.on('start game', () => this.startGameLoki());
        socket.on('nominate player', (playerId: string) => this.nominatePlayerLoki(playerId));
        socket.on('global vote', (vote) => this.voteLoki(vote, true));
        socket.on('quest vote', (vote) => this.voteLoki(vote));
        socket.on('confirm party', () => this.confirmPartyLoki());
        socket.on('start new vote', () => this.startNewVoteLoki());
        socket.on('assassinate', (targetId: string) => this.assassinateLoki(targetId));
        socket.on('toggle extra role', (roleKey: ROLE_LIST) => this.toggleExtraRoleLoki(roleKey));
        socket.on('get existing player', (params: { playerUUID: string; roomCode: string; nickname: string }) =>
            this.getExistingPlayerLoki(params),
        );
        socket.on('change player name', (newName: string) => this.changePlayerNameLoki(newName));

        socket.on('init room', (params: { roomCode: string; nickname: string }) => this.initRoom(params));

        socket.on('join room', ({ roomCode, nickname }: { roomCode: string; nickname: string }) =>
            this.addPlayerLoki({ roomCode, nickname }),
        );
    }

    initRoom(params: { roomCode: string; nickname: string }) {
        try {
            const { roomCode, nickname } = params;
            addRoom(roomCode);
            this.socket.join(roomCode);
            this.roomCode = roomCode;

            this.addPlayerLoki({ nickname, roomCode, isHost: true });
        } catch (error) {
            console.log(error);
        }
    }

    addPlayerLoki({ nickname, roomCode, isHost = false }: { nickname: string; roomCode: string; isHost?: boolean }) {
        this.roomCode = roomCode;
        this.socket.join(roomCode);

        const playerUUID = this.useLoki(addPlayerToRoom, { nickname, roomCode, isHost, socketId: this.socket.id });

        this.ns.to(this.socket.id).emit('register', playerUUID);

        this.ns.to(roomCode).emit('players', this.room.players);
    }

    async getExistingPlayerLoki(params: { playerUUID: string; roomCode: string; nickname: string }) {
        const { playerUUID, roomCode, nickname } = params;
        this.roomCode = roomCode;

        const { room } = this;

        if (room) {
            const playerExist = room.players?.find((p) => p.playerUUID === playerUUID);

            if (playerExist) {
                this.roomCode = roomCode;
                this.socket.join(roomCode);
                playerExist.connected = true;
                playerExist.socketId = this.socket.id;
                if (playerExist.isCurrentLeader) {
                    room.currentLeaderId = this.socket.id;
                }
                Avalon.update(room);
                this.ns.to(roomCode).emit('update room', this.room);
                this.ns.to(this.socket.id).emit('assigned role', {
                    roleName: playerExist.roleName,
                    roleKey: playerExist.roleKey,
                    side: playerExist.side,
                    secretInfo: playerExist.secretInformation,
                    description: playerExist.roleDescription,
                });
            } else {
                this.addPlayerLoki({ nickname, roomCode });
            }
        } else {
            this.initRoom({ roomCode, nickname });
        }
    }

    disconnectLoki() {
        const room = this.room;
        if (room && !room.players.length) Avalon.remove(room);
    }

    disconnectingLoki() {
        const { id } = this.socket;
        const room = this.room;
        updatePlayerLoki({ room, socketId: id, updatedProperties: { connected: false } });

        this.ns.to(this.roomCode).emit('update room', room);
    }

    initAndSendQuestsLoki() {
        if (this.room) {
            initQuestsLoki(this.room);

            this.ns.to(this.roomCode).emit(
                'quests',
                this.room.quests.sort(
                    (a: { questNumber: number }, b: { questNumber: number }) => a.questNumber - b.questNumber,
                ),
            );
        }
    }

    startGameLoki() {
        const { room } = this;

        startNewVoteCycleLoki(room);
        assignRolesLoki(room);

        // TODO: exclude secret info from room for this
        if (room) {
            const players = room.players;

            room.gameInProgress = true;
            room.nominationInProgress = true;
            room.globalVoteInProgress = false;
            room.questVoteInProgress = false;
            room.assassinationInProgress = false;
            room.revealVotes = false;
            room.revealRoles = false;
            room.missedTeamVotes = 1;
            room.currentQuest = 1;
            room.currentLeaderId = players.find((player: any) => player.isCurrentLeader)?.socketId || '';
            room.gameMessage = `Leader must nominate players for the quest.`;
            // TODO check that at least 5 players joined
            this.ns.to(this.roomCode).emit('update room', room);
            players.forEach((player: any) => {
                this.ns.to(player.socketId).emit('assigned role', {
                    roleName: player.roleName,
                    roleKey: player.roleKey,
                    side: player.side,
                    secretInfo: player.secretInformation,
                    description: player.roleDescription,
                });
            });
            Avalon.update(room);
            this.initAndSendQuestsLoki();
            this.ns.to(this.roomCode).emit('player killed', null);
        }
    }

    nominatePlayerLoki(playerId: string) {
        this.useLoki(nominatePlayerLoki, playerId);
        this.ns.to(this.roomCode).emit('players', this.room.players);
    }

    // TODO Optimize this and maybe split global and quest votes
    voteLoki(vote: 'yes' | 'no', isGlobal: boolean = false) {
        const {
            room,
            socket: { id: voterId },
        } = this;
        if (!room) return;
        this.ns.to(this.roomCode).emit('player voted', voterId);
        if (isGlobal) {
            updatePlayerLoki({ room: this.room, socketId: voterId, updatedProperties: { globalVote: vote } });
            handleGlobalVoteLoki(this.room);
        } else {
            updatePlayerLoki({ room: this.room, socketId: voterId, updatedProperties: { questVote: vote } });
            handleQuestVoteLoki(this.room);
        }

        // TODO create function to get room or players with excluded properties.
        if (this.room?.gameInProgress === false) {
            this.ns.to(this.roomCode).emit('update room', this.room);
        } else {
            this.ns.to(this.roomCode).emit('update room', this.room);
        }
    }

    confirmPartyLoki() {
        const { room } = this;
        if (room) {
            const activeQuest = getActiveQuestLoki(this.room);
            const nominatedPlayerCount = room.players.filter((p) => p.nominated).length;

            if (nominatedPlayerCount === activeQuest?.questPartySize!) {
                room.nominationInProgress = false;
                room.globalVoteInProgress = true;
                room.revealVotes = false;
                room.gameMessage = 'Everyone should vote for the selected party';

                this.useLoki(clearVotesLoki);
                this.ns.to(this.roomCode).emit('update room', room);
            } else {
                this.ns.to(this.roomCode).emit('not enough players');
            }
        }
    }

    assassinateLoki(targetId: string) {
        const playerKilled = this.useLoki(assassinateLoki, targetId, this.socket.id);
        if (playerKilled) {
            this.ns.to(this.roomCode).emit('player killed', targetId);
        }
        this.ns.to(this.roomCode).emit('update room', this.room);
    }

    toggleExtraRoleLoki(roleKey: ROLE_LIST) {
        const room = this.room;
        if (room) {
            room.extraRoles = room.extraRoles.includes(roleKey)
                ? room.extraRoles.filter((role) => role !== roleKey)
                : [...room.extraRoles, roleKey];
            Avalon.update(room);
            this.ns.to(this.roomCode).emit('update room', room);
        }
    }

    startNewVoteLoki() {
        startNewVoteCycleLoki(this.room);
    }

    changePlayerNameLoki(newName: string) {
        const room = this.room;
        const player = room?.players.find((p) => p.socketId === this.socket.id);

        if (room && player) {
            player.name = newName;
            Avalon.update(room);
            this.ns.to(this.roomCode).emit('update room', this.room);
        }
    }

    get room(): AvalonLokiRoom {
        return (this.roomCode ? getRoomByCode(this.roomCode) || {} : {}) as AvalonLokiRoom;
    }

    prevLog = {};

    useLoki = (fun: any, ...restArgs: any) => {
        const { room } = this;
        if (room) {
            const retVal = fun(room, ...restArgs);
            Avalon.update(room);
            const changesArr = JSON.parse(db.serializeChanges(['rooms'])) || [];
            const last = changesArr[changesArr.length - 1];
            this.compareObjects(this.prevLog, last);
            this.prevLog = last;
            return retVal;
        }
    };

    // TODO: MOVE to general utils
    compareObjects(obj1: { [x: string]: any }, obj2: { [x: string]: any }, path = '') {
        for (let key in obj1) {
            if (
                typeof obj1[key] === 'object' &&
                obj1[key] !== null &&
                typeof obj2[key] === 'object' &&
                obj2[key] !== null
            ) {
                this.compareObjects(obj1[key], obj2[key], `${path}.${key}`);
            } else if (obj1[key] !== obj2[key]) {
                console.log(`${path}.${key}: changed from ${obj1[key]} to ${obj2[key]}`);
            }
        }
    }
}

const initAvalonNameSpace = (io: Server) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new AvalonConnection(avalonNameSpace, socket);
    });
};
export { initAvalonNameSpace };
