"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNameSpace = void 0;
const types_1 = require("./types");
const dbActions_1 = require("./dbActions");
class Connection {
    socket;
    ns;
    roomCode;
    constructor(ns, socket) {
        this.socket = socket;
        this.ns = ns;
        this.roomCode = '';
        socket.on('disconnect', () => this.disconnect());
        socket.on('disconnecting', () => this.disconnecting());
        socket.on('start game', async () => await this.startGame());
        socket.on('nominate player', async (playerId) => await this.nominatePlayer(playerId));
        socket.on('global vote', async (vote) => await this.vote(vote, true));
        socket.on('quest vote', async (vote) => await this.vote(vote));
        socket.on('confirm party', async () => await this.confirmParty());
        socket.on('start new vote', async () => await this.startNewVote());
        socket.on('room', async ({ roomCode, nickname }) => {
            const [_, created] = await (0, dbActions_1.createRoom)(roomCode, socket.id);
            socket.join(roomCode);
            this.roomCode = roomCode;
            const playerCount = await (0, dbActions_1.countPlayers)(roomCode);
            await (0, dbActions_1.createPlayer)({
                roomCode,
                socketId: socket.id,
                name: nickname,
                isHost: created,
                role: '',
                order: playerCount + 1,
                questVote: null,
                globalVote: null,
            });
            const players = await (0, dbActions_1.getPlayerList)(roomCode);
            ns.to(roomCode).emit('players', players);
            if (players.length > 1) {
                this.initAndSendQuests(players.length);
            }
        });
    }
    async disconnecting() {
        const { id } = this.socket;
        await (0, dbActions_1.findAndDeletePlayer)(id);
        const players = await (0, dbActions_1.getPlayerList)(this.roomCode);
        this.ns.to(this.roomCode).emit('players', players);
    }
    async initAndSendQuests(playerCount) {
        await (0, dbActions_1.initQuests)(this.roomCode, playerCount);
        const quests = await (0, dbActions_1.getQuests)(this.roomCode);
        this.ns.to(this.roomCode).emit('quests', quests.sort((a, b) => a.questNumber - b.questNumber));
    }
    async startGame() {
        // TODO Support extra roles
        await (0, dbActions_1.assignRoles)(this.roomCode);
        const players = await (0, dbActions_1.getPlayerList)(this.roomCode);
        // random number
        const roomInfo = await (0, dbActions_1.getRoomWithPlayers)(this.roomCode);
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
    async nominatePlayer(playerId) {
        // Check nomination limit
        await (0, dbActions_1.nominatePlayer)(this.roomCode, playerId);
        const playerList = await (0, dbActions_1.getPlayerList)(this.roomCode);
        this.ns.to(this.roomCode).emit('players', playerList);
    }
    // TODO Optimize this and maybe split global and quest votes
    async vote(vote, isGlobal = false) {
        const voterId = this.socket.id;
        this.ns.to(this.roomCode).emit('player voted', voterId);
        if (isGlobal) {
            await (0, dbActions_1.updatePlayer)({ socketId: voterId, updatedProperties: { globalVote: vote } });
            const gameRes = await (0, dbActions_1.handleGlobalVote)(this.roomCode);
            if (gameRes) {
                this.ns.to(this.roomCode).emit('game over', gameRes);
            }
        }
        else {
            await (0, dbActions_1.updatePlayer)({ socketId: voterId, updatedProperties: { questVote: vote } });
            const gameRes = await (0, dbActions_1.handleQuestVote)(this.roomCode);
            if (gameRes) {
                this.ns.to(this.roomCode).emit('game over', gameRes);
            }
        }
        const roomInfo = await (0, dbActions_1.getRoomWithPlayers)(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', roomInfo);
    }
    // TODO maybe refactor to use save
    async confirmParty() {
        const activeQuest = await (0, dbActions_1.getActiveQuest)(this.roomCode);
        const nominatedPlayerCount = await (0, dbActions_1.countPlayers)(this.roomCode, { nominated: true });
        if (nominatedPlayerCount === activeQuest?.questPartySize) {
            await (0, dbActions_1.updateRoom)(this.roomCode, {
                nominationInProgress: false,
                globalVoteInProgress: true,
                revealVotes: false,
            });
            const roomInfo = await (0, dbActions_1.getRoomWithPlayers)(this.roomCode);
            await (0, dbActions_1.clearVotes)(this.roomCode);
            this.ns.to(this.roomCode).emit('update room', roomInfo);
        }
        else {
            this.ns.to(this.roomCode).emit('not enough players');
        }
    }
    async assassinate(targetId) {
        const assassin = await (0, dbActions_1.findPlayer)(this.roomCode, { role: types_1.ROLE_LIST.ASSASSIN });
        const target = await (0, dbActions_1.findPlayer)(this.roomCode, { socketId: targetId });
        if (assassin?.socketId === this.socket.id) {
            const merlinKilled = target?.role === types_1.ROLE_LIST.MERLIN;
            this.ns.to(this.roomCode).emit('merlin killed', merlinKilled);
        }
    }
    async startNewVote() {
        await (0, dbActions_1.startNewVoteCycle)(this.roomCode);
    }
    disconnect() { }
}
const initNameSpace = (io) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new Connection(avalonNameSpace, socket);
    });
};
exports.initNameSpace = initNameSpace;
