import { Namespace, Server, Socket } from 'socket.io';
import { sequelize } from '../config/db';
import {
    createPlayer,
    createRoom,
    getPlayerList,
    assignRoles,
    getRoomWithPlayers,
    updateRoom,
    initQuests,
    getQuests,
    nominatePlayer,
    updatePlayer,
    switchToNextLeader,
    getRoom,
    countPlayers,
    findAndDeletePlayer,
    handleGlobalVote,
    startNewVoteCycle,
    handleQuestVote,
    clearVotes,
} from './dbActions';

class Connection {
    socket: Socket;
    ns: Namespace;
    roomCode: string;

    constructor(ns: Namespace, socket: Socket) {
        this.socket = socket;
        this.ns = ns;
        this.roomCode = '';

        socket.on('disconnect', () => this.disconnect());
        socket.on('disconnecting', () => this.disconnecting());
        socket.on('start game', async () => await this.startGame());
        socket.on('nominate player', async (playerId: string) => await this.nominatePlayer(playerId));
        socket.on('global vote', async (vote) => await this.vote(vote, true));
        socket.on('quest vote', async (vote) => await this.vote(vote));
        socket.on('confirm party', async () => await this.confirmParty());
        socket.on('start new vote', async () => await this.startNewVote());

        socket.on('room', async ({ roomCode, nickname }) => {
            const [_, created] = await createRoom(roomCode, socket.id);

            socket.join(roomCode);
            this.roomCode = roomCode;
            const playerCount = await countPlayers(roomCode);
            await createPlayer({
                roomCode,
                socketId: socket.id,
                name: nickname,
                isHost: created,
                role: '',
                order: playerCount + 1,
                questVote: null,
                globalVote: null,
            });

            const players = await getPlayerList(roomCode);
            ns.to(roomCode).emit('players', players);
            if (players.length > 1) {
                this.initAndSendQuests(players.length);
            }
        });
    }

    async disconnecting() {
        const { id } = this.socket;
        await findAndDeletePlayer(id);
        const players = await getPlayerList(this.roomCode);
        this.ns.to(this.roomCode).emit('players', players);
    }

    async initAndSendQuests(playerCount: number) {
        await initQuests(this.roomCode, playerCount);
        const quests = await getQuests(this.roomCode);
        this.ns.to(this.roomCode).emit(
            'quests',
            quests.sort((a, b) => a.questNumber - b.questNumber),
        );
    }

    // TODO make it so you cant see the roles of others through network requests
    async startGame() {
        // TODO Support extra roles
        await assignRoles(this.roomCode);
        const players = await getPlayerList(this.roomCode);
        // random number
        await updateRoom(this.roomCode, {
            gameInProgress: true,
            nominationInProgress: true,
            globalVoteInProgress: false,
            questVoteInProgress: false,
            currentLeaderId: players.find((player) => player.isCurrentLeader)?.socketId || '',
        });
        // this.getQuests();
        const roomInfo = await getRoomWithPlayers(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', roomInfo);
        players.forEach((player) => {
            this.ns.to(player.socketId).emit('assigned role', player.role);
        });
    }

    async nominatePlayer(playerId: string) {
        // Check nomination limit
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
        this.ns.to(this.roomCode).emit('update room', roomInfo);
    }

    async confirmParty() {
        await updateRoom(this.roomCode, {
            nominationInProgress: false,
            globalVoteInProgress: true,
            revealVotes: false,
        });
        await clearVotes(this.roomCode);
        const roomInfo = await getRoomWithPlayers(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', roomInfo);
    }

    async startNewVote() {
        await startNewVoteCycle(this.roomCode);
    }

    disconnect() {}
}

const initNameSpace = (io: Server) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new Connection(avalonNameSpace, socket);
    });
};
export { initNameSpace };
