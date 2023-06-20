import { AVATARS, ROLE_LIST } from './types';
import { Namespace, Server, Socket } from 'socket.io';
import {
    createPlayer,
    createRoom,
    getPlayerList,
    assignRoles,
    getRoomWithPlayers,
    initQuests,
    getQuests,
    nominatePlayer,
    updatePlayer,
    getRoom,
    countPlayers,
    deleteRoomIfNoPlayers,
    handleGlobalVote,
    startNewVoteCycle,
    handleQuestVote,
    clearVotes,
    getActiveQuest,
    findPlayer,
    getCompleteRoom,
} from './AvalonDbActions';
import { shuffle } from '../../utils/utils';
import { addRoom, assignRolesLoki, getRoomByCode, initQuestsLoki, startNewVoteCycleLoki } from './AvalonLokiActions';
import { v4 as uuidv4 } from 'uuid';
import { Avalon } from '../../config/lokiDB';

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
        socket.on('start game', async () => this.startGameLoki());
        socket.on('nominate player', async (playerId: string) => await this.nominatePlayer(playerId));
        socket.on('global vote', async (vote) => await this.vote(vote, true));
        socket.on('quest vote', async (vote) => await this.vote(vote));
        socket.on('confirm party', async () => await this.confirmParty());
        socket.on('start new vote', async () => await this.startNewVote());
        socket.on('assassinate', async (targetId: string) => await this.assassinate(targetId));
        socket.on('toggle extra role', async (roleKey: ROLE_LIST) => await this.toggleExtraRole(roleKey));
        // socket.on(
        //     'get existing player',
        //     async (params: { playerUUID: string; roomCode: string; nickname: string }) =>
        //         await this.getExistingPlayer(params),
        // );
        socket.on('change player name', async (newName: string) => await this.changePlayerName(newName));

        socket.on('init room', async (params: { roomCode: string; nickname: string }) => this.initRoom(params));

        socket.on('join room', async ({ roomCode, nickname }: { roomCode: string; nickname: string }) =>
            this.addPlayerLoki({ roomCode, nickname }),
        );
    }

    initRoom(params: { roomCode: string; nickname: string }) {
        try {
            const { roomCode, nickname } = params;
            console.log(roomCode, nickname);

            // const [_, created] = await createRoom(roomCode, this.socket.id);
            addRoom(roomCode);
            console.log('added room');

            this.socket.join(roomCode);
            this.roomCode = roomCode;
            // await this.addPlayerToRoom({ nickname, isHost: created, roomCode });

            this.addPlayerLoki({ nickname, roomCode, isHost: true });
        } catch (error) {
            console.log(error);
        }
    }

    addPlayerLoki({ nickname, roomCode, isHost = false }: { nickname: string; roomCode: string; isHost?: boolean }) {
        this.roomCode = roomCode;
        this.socket.join(roomCode);
        const room = getRoomByCode(roomCode);
        console.log('ROOM', room);
        if (room) {
            //@ts-ignore
            const playerCount = room.players.length;

            const avatars = Object.values(room.takenImages) as Array<{ key: string; taken: boolean }>;
            const availableAvatars = avatars.filter((avatar) => !avatar.taken);
            const suggestedAvatar = !!availableAvatars.length
                ? shuffle(availableAvatars)[0]
                : avatars[Math.floor(Math.random() * avatars.length)];

            room.takenImages[suggestedAvatar.key].taken = true;
            const playerUUID = uuidv4();

            room.players.push({
                playerUUID,
                roomCode,
                socketId: this.socket.id,
                name: nickname,
                isHost,
                order: playerCount + 1,
                connected: true,
                imageName: suggestedAvatar.key,
            });
            Avalon.update(room);
            this.ns.to(this.socket.id).emit('register', playerUUID);
            //@ts-ignore
            this.ns.to(roomCode).emit('players', room.players);
        }
    }

    async addPlayerToRoom({
        nickname,
        roomCode,
        isHost = false,
    }: {
        nickname: string;
        roomCode: string;
        isHost?: boolean;
    }) {
        this.roomCode = roomCode;
        this.socket.join(roomCode);

        const playerCount = await countPlayers(roomCode);
        const room = await getRoom(roomCode);
        if (room) {
            const avatars = Object.values(room.takenImages);
            const availableAvatars = avatars.filter((avatar) => !avatar.taken);

            const suggestedAvatar = !!availableAvatars.length
                ? shuffle(availableAvatars)[0]
                : avatars[Math.floor(Math.random() * avatars.length)];

            room.takenImages[suggestedAvatar.key].taken = true;
            room.changed('takenImages', true);
            await room.save();

            const newPlayer = await createPlayer({
                roomCode,
                socketId: this.socket.id,
                name: nickname,
                isHost,
                roleName: '',
                roleKey: null,
                order: playerCount + 1,
                questVote: null,
                globalVote: null,
                connected: true,
                imageName: suggestedAvatar.key,
            });

            this.ns.to(this.socket.id).emit('register', newPlayer.playerUUID);
            const players = await getPlayerList(roomCode);
            this.ns.to(roomCode).emit('players', players);
        }
    }

    async getExistingPlayer(params: { playerUUID: string; roomCode: string; nickname: string }) {
        const { playerUUID, roomCode, nickname } = params;
        const room = await getRoom(roomCode);

        if (!!room) {
            const playerExist = await findPlayer(roomCode, { playerUUID });

            if (playerExist) {
                this.roomCode = roomCode;
                this.socket.join(roomCode);
                playerExist.connected = true;
                playerExist.socketId = this.socket.id;
                if (playerExist.isCurrentLeader) {
                    room.currentLeaderId = this.socket.id;
                    await room.save();
                }
                await playerExist.save();
                const roomInfo = await getRoomWithPlayers(roomCode);
                this.ns.to(roomCode).emit('update room', roomInfo);
                this.ns.to(this.socket.id).emit('assigned role', {
                    roleName: playerExist.roleName,
                    roleKey: playerExist.roleKey,
                    side: playerExist.side,
                    secretInfo: playerExist.secretInformation,
                    description: playerExist.roleDescription,
                });
            } else {
                await this.addPlayerToRoom({ nickname, roomCode });
            }
        } else {
            await this.initRoom({ roomCode, nickname });
        }
    }

    async disconnect() {
        await deleteRoomIfNoPlayers(this.roomCode);
    }
    async disconnecting() {
        const { id } = this.socket;
        await updatePlayer({ socketId: id, updatedProperties: { connected: false } });
        const roomInfo = await getRoomWithPlayers(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', roomInfo);
    }

    async initAndSendQuests(playerCount: number) {
        await initQuests(this.roomCode, playerCount);
        const quests = await getQuests(this.roomCode);
        this.ns.to(this.roomCode).emit(
            'quests',
            quests.sort((a, b) => a.questNumber - b.questNumber),
        );
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

    async startGame() {
        await startNewVoteCycle(this.roomCode);
        await assignRoles(this.roomCode);
        const players = await getPlayerList(this.roomCode);

        const roomInfo = await getRoomWithPlayers(this.roomCode);

        if (roomInfo) {
            roomInfo.gameInProgress = true;
            roomInfo.nominationInProgress = true;
            roomInfo.globalVoteInProgress = false;
            roomInfo.questVoteInProgress = false;
            roomInfo.assassinationInProgress = false;
            roomInfo.revealVotes = false;
            roomInfo.revealRoles = false;
            roomInfo.missedTeamVotes = 1;
            roomInfo.currentQuest = 1;
            roomInfo.currentLeaderId = players.find((player) => player.isCurrentLeader)?.socketId || '';
            roomInfo.gameMessage = `Leader must nominate players for the quest.`;
            await roomInfo.save();
            // TODO check that at least 5 players joined
            this.ns.to(this.roomCode).emit('update room', roomInfo);
            players.forEach((player) => {
                this.ns.to(player.socketId).emit('assigned role', {
                    roleName: player.roleName,
                    roleKey: player.roleKey,
                    side: player.side,
                    secretInfo: player.secretInformation,
                    description: player.roleDescription,
                });
            });
            this.initAndSendQuests(players.length);
            this.ns.to(this.roomCode).emit('player killed', null);
        }
    }

    startGameLoki() {
        console.log('START GAME');
        // TODO change to getter?
        const room = this.room;

        startNewVoteCycleLoki(room);
        console.log('Assign roles');
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
            Avalon.update(room);
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
            this.initAndSendQuestsLoki();
            this.ns.to(this.roomCode).emit('player killed', null);
        }
    }

    async nominatePlayer(playerId: string) {
        await nominatePlayer(this.roomCode, playerId);
        const playerList = await getPlayerList(this.roomCode);
        this.ns.to(this.roomCode).emit('players', playerList);
    }

    // TODO Optimize this and maybe split global and quest votes
    async vote(vote: 'yes' | 'no', isGlobal: boolean = false) {
        const voterId = this.socket.id;
        this.ns.to(this.roomCode).emit('player voted', voterId);
        if (isGlobal) {
            await updatePlayer({ socketId: voterId, updatedProperties: { globalVote: vote } });
            await handleGlobalVote(this.roomCode);
        } else {
            await updatePlayer({ socketId: voterId, updatedProperties: { questVote: vote } });
            await handleQuestVote(this.roomCode);
        }
        const roomInfo = await getRoomWithPlayers(this.roomCode);
        if (roomInfo?.gameInProgress === false) {
            this.ns.to(this.roomCode).emit('update room', await getCompleteRoom(this.roomCode));
        } else {
            this.ns.to(this.roomCode).emit('update room', roomInfo);
        }
    }

    async confirmParty() {
        const activeQuest = await getActiveQuest(this.roomCode);
        const nominatedPlayerCount = await countPlayers(this.roomCode, { nominated: true });
        if (nominatedPlayerCount === activeQuest?.questPartySize!) {
            const roomInfo = await getRoomWithPlayers(this.roomCode);
            if (roomInfo) {
                roomInfo.nominationInProgress = false;
                roomInfo.globalVoteInProgress = true;
                roomInfo.revealVotes = false;
                roomInfo.gameMessage = 'Everyone should vote for the selected party';
                await roomInfo.save();
            }
            await clearVotes(this.roomCode);
            this.ns.to(this.roomCode).emit('update room', roomInfo);
        } else {
            this.ns.to(this.roomCode).emit('not enough players');
        }
    }

    async assassinate(targetId: string) {
        const assassin = await findPlayer(this.roomCode, { roleKey: ROLE_LIST.ASSASSIN });
        const target = await findPlayer(this.roomCode, { socketId: targetId });
        const room = await getCompleteRoom(this.roomCode);
        if (room) {
            if (assassin?.socketId === this.socket.id) {
                this.ns.to(this.roomCode).emit('player killed', targetId);
                const merlinKilled = target?.roleKey === ROLE_LIST.MERLIN;
                room.gameMessage = merlinKilled
                    ? 'Merlin was killed! Evil are now victorious'
                    : 'Assassin has missed! The victory stays on the Good side';
                room.revealRoles = true;
            }
            room.gameInProgress = false;
            room.revealVotes = false;
            await room.save();
            this.ns.to(this.roomCode).emit('update room', room);
        }
    }

    async toggleExtraRole(roleKey: ROLE_LIST) {
        const room = await getRoom(this.roomCode);
        if (room && room.extraRoles) {
            room.extraRoles = room.extraRoles.includes(roleKey)
                ? room.extraRoles.filter((role) => role !== roleKey)
                : [...room.extraRoles, roleKey];
            await room.save();
            this.ns.to(this.roomCode).emit('update room', room);
        }
    }

    async startNewVote() {
        await startNewVoteCycle(this.roomCode);
    }

    async changePlayerName(newName: string) {
        const player = await findPlayer(this.roomCode, { socketId: this.socket.id });

        if (player) {
            player.name = newName;
            await player.save();
            this.ns.to(this.roomCode).emit('update room', await getRoomWithPlayers(this.roomCode));
        }
    }

    get room() {
        return (this.roomCode ? getRoomByCode(this.roomCode) || {} : {}) as ReturnType<typeof getRoomByCode>;
    }
}

const initAvalonNameSpace = (io: Server) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new AvalonConnection(avalonNameSpace, socket);
    });
};
export { initAvalonNameSpace };
