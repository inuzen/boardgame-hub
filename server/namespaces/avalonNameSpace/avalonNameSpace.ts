import { ROLE_LIST } from './types';
import { Namespace, Server, Socket } from 'socket.io';
import {
    AvalonLokiRoom,
    addPlayerToRoomLoki,
    addRoom,
    assassinateLoki,
    confirmPartyLoki,
    getRoomByCode,
    handleGlobalVoteLoki,
    handleQuestVoteLoki,
    nominatePlayerLoki,
    startGameLoki,
    startNewVoteCycleLoki,
    toggleExtraRoleLoki,
    updatePlayerLoki,
} from './AvalonLokiActions';
import { Avalon, db } from '../../config/lokiDB';

class AvalonConnection {
    socket: Socket;
    ns: Namespace;
    roomCode: string;

    constructor(ns: Namespace, socket: Socket) {
        this.socket = socket;
        this.ns = ns;
        this.roomCode = '';

        socket.on('disconnect', () => this.disconnect());
        socket.on('disconnecting', () => this.disconnecting());
        socket.on('start game', () => this.startGame());
        socket.on('nominate player', (playerId: string) => this.nominatePlayer(playerId));
        socket.on('global vote', (vote) => this.vote(vote, true));
        socket.on('quest vote', (vote) => this.vote(vote));
        socket.on('confirm party', () => this.confirmParty());
        socket.on('start new vote', () => this.startNewVote());
        socket.on('assassinate', (targetId: string) => this.assassinate(targetId));
        socket.on('toggle extra role', (roleKey: ROLE_LIST) => this.toggleExtraRole(roleKey));
        socket.on('get existing player', (params: { playerUUID: string; roomCode: string; nickname: string }) =>
            this.getExistingPlayer(params),
        );
        socket.on('change player name', (newName: string) => this.changePlayerName(newName));

        socket.on('init room', (params: { roomCode: string; nickname: string }) => this.initRoom(params));

        socket.on('join room', ({ roomCode, nickname }: { roomCode: string; nickname: string }) =>
            this.addPlayer({ roomCode, nickname }),
        );
    }

    initRoom(params: { roomCode: string; nickname: string }) {
        try {
            const { roomCode, nickname } = params;
            addRoom(roomCode);
            this.socket.join(roomCode);
            this.roomCode = roomCode;

            this.addPlayer({ nickname, roomCode, isHost: true });
        } catch (error) {
            console.log(error);
        }
    }

    addPlayer({ nickname, roomCode, isHost = false }: { nickname: string; roomCode: string; isHost?: boolean }) {
        this.roomCode = roomCode;
        this.socket.join(roomCode);

        const playerUUID = this.useLoki(addPlayerToRoomLoki, { nickname, roomCode, isHost, socketId: this.socket.id });

        this.ns.to(this.socket.id).emit('register', playerUUID);
        this.ns.to(roomCode).emit('players', this.room.players);
    }

    getExistingPlayer(params: { playerUUID: string; roomCode: string; nickname: string }) {
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
                this.addPlayer({ nickname, roomCode });
            }
        } else {
            this.initRoom({ roomCode, nickname });
        }
    }

    disconnect() {
        const room = this.room;
        if (room && !room.players.length) Avalon.remove(room);
    }

    disconnecting() {
        const { id } = this.socket;
        this.useLoki(updatePlayerLoki, { socketId: id, updatedProperties: { connected: false } });
        this.ns.to(this.roomCode).emit('update room', this.room);
    }

    startGame() {
        const { room } = this;

        // TODO check that at least 5 players joined
        this.useLoki(startGameLoki);

        // TODO: exclude secret info from room for this
        this.ns.to(this.roomCode).emit('update room', room);
        this.room.players.forEach((player: any) => {
            this.ns.to(player.socketId).emit('assigned role', {
                roleName: player.roleName,
                roleKey: player.roleKey,
                side: player.side,
                secretInfo: player.secretInformation,
                description: player.roleDescription,
            });
        });
        this.ns.to(this.roomCode).emit('quests', this.room.quests);
        this.ns.to(this.roomCode).emit('player killed', null);
    }

    nominatePlayer(playerId: string) {
        this.useLoki(nominatePlayerLoki, playerId);
        this.ns.to(this.roomCode).emit('players', this.room.players);
    }

    // TODO Optimize this and maybe split global and quest votes
    vote(vote: 'yes' | 'no', isGlobal: boolean = false) {
        const {
            socket: { id: voterId },
        } = this;

        this.ns.to(this.roomCode).emit('player voted', voterId);
        if (isGlobal) {
            this.useLoki(updatePlayerLoki, { socketId: voterId, updatedProperties: { globalVote: vote } });
            this.useLoki(handleGlobalVoteLoki);
        } else {
            this.useLoki(updatePlayerLoki, { socketId: voterId, updatedProperties: { questVote: vote } });
            this.useLoki(handleQuestVoteLoki);
        }

        // TODO create function to get room or players with excluded properties.
        if (this.room?.gameInProgress === false) {
            this.ns.to(this.roomCode).emit('update room', this.room);
        } else {
            this.ns.to(this.roomCode).emit('update room', this.room);
        }
    }

    confirmParty() {
        const partyComplete = this.useLoki(confirmPartyLoki);
        if (partyComplete) {
            this.ns.to(this.roomCode).emit('update room', this.room);
        } else {
            this.ns.to(this.roomCode).emit('not enough players');
        }
    }

    assassinate(targetId: string) {
        const playerKilled = this.useLoki(assassinateLoki, targetId, this.socket.id);
        if (playerKilled) {
            this.ns.to(this.roomCode).emit('player killed', targetId);
        }
        this.ns.to(this.roomCode).emit('update room', this.room);
    }

    toggleExtraRole(roleKey: ROLE_LIST) {
        this.useLoki(toggleExtraRoleLoki, roleKey);
        this.ns.to(this.roomCode).emit('update room', this.room);
    }

    startNewVote() {
        this.useLoki(startNewVoteCycleLoki);
    }

    changePlayerName(newName: string) {
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

    useLoki = (fun: (room: AvalonLokiRoom, ...restArgs: any[]) => any, ...restArgs: any[]) => {
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
