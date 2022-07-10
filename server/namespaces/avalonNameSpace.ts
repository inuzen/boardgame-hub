import { ROLE_LIST } from './types';
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
    getActiveQuest,
    findPlayer,
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

    async startGame() {
        // TODO Support extra roles
        await assignRoles(this.roomCode);
        const players = await getPlayerList(this.roomCode);
        // random number
        const roomInfo = await getRoomWithPlayers(this.roomCode);

        if (roomInfo) {
            roomInfo.gameInProgress = true;
            roomInfo.nominationInProgress = true;
            roomInfo.globalVoteInProgress = false;
            roomInfo.questVoteInProgress = false;
            roomInfo.currentLeaderId = players.find((player) => player.isCurrentLeader)?.socketId || '';
            roomInfo.gameMessage = `Leader must nominate players for the quest.`;
            await roomInfo.save();

            this.ns.to(this.roomCode).emit('update room', roomInfo);
            players.forEach((player) => {
                console.log(player.secretInformation, 'foo');

                this.ns
                    .to(player.socketId)
                    .emit('assigned role', { role: player.role, secretInfo: player.secretInformation });
            });
        }
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
            const gameRes = await handleGlobalVote(this.roomCode);
            if (gameRes) {
                this.ns.to(this.roomCode).emit('game over', gameRes);
            }
        } else {
            await updatePlayer({ socketId: voterId, updatedProperties: { questVote: vote } });
            const gameRes = await handleQuestVote(this.roomCode);
            if (gameRes) {
                this.ns.to(this.roomCode).emit('game over', gameRes);
            }
        }
        const roomInfo = await getRoomWithPlayers(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', roomInfo);
    }

    // TODO maybe refactor to use save
    async confirmParty() {
        const activeQuest = await getActiveQuest(this.roomCode);
        const nominatedPlayerCount = await countPlayers(this.roomCode, { nominated: true });
        if (nominatedPlayerCount === activeQuest?.questPartySize!) {
            await updateRoom(this.roomCode, {
                nominationInProgress: false,
                globalVoteInProgress: true,
                revealVotes: false,
            });
            const roomInfo = await getRoomWithPlayers(this.roomCode);
            await clearVotes(this.roomCode);
            this.ns.to(this.roomCode).emit('update room', roomInfo);
        } else {
            this.ns.to(this.roomCode).emit('not enough players');
        }
    }

    async assassinate(targetId: string) {
        const assassin = await findPlayer(this.roomCode, { role: ROLE_LIST.ASSASSIN });
        const target = await findPlayer(this.roomCode, { socketId: targetId });
        if (assassin?.socketId === this.socket.id) {
            const merlinKilled = target?.role === ROLE_LIST.MERLIN;
            this.ns.to(this.roomCode).emit('merlin killed', merlinKilled);
        }
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
