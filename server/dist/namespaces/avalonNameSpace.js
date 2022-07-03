"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNameSpace = void 0;
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
        // socket.on('get roles', async () => await this.assignRoles());
        // socket.on('get quests', async () => await this.getQuests());
        socket.on('start game', async () => await this.startGame());
        socket.on('room', async ({ roomCode, nickname }) => {
            const [_, created] = await (0, dbActions_1.createRoom)(roomCode, socket.id);
            socket.join(roomCode);
            this.roomCode = roomCode;
            await (0, dbActions_1.createPlayer)({ roomCode, socketId: socket.id, name: nickname, isHost: created });
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
    }
    async initAndSendQuests(playerCount) {
        await (0, dbActions_1.initQuests)(this.roomCode, playerCount);
        const quests = await (0, dbActions_1.getQuests)(this.roomCode);
        this.ns.to(this.roomCode).emit('quests', quests.sort((a, b) => a.questNumber - b.questNumber));
    }
    // TODO make it so you cant see the roles of others through network requests
    async startGame() {
        // TODO Support extra roles
        await (0, dbActions_1.assignRoles)(this.roomCode);
        // this.getQuests();
        const roomInfo = await (0, dbActions_1.getRoomWithPlayers)(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', { roomInfo });
    }
    // async assignRoles() {
    // await assignRoles(this.roomCode);
    // const updatedPlayers = await getPlayerList(this.roomCode);
    // updatedPlayers.forEach((player: any) => {
    //     // TODO include initial role message
    //     this.ns.to(player.socketId).emit('role', player.role);
    // });
    // this.ns.to(this.roomCode).emit('quests', getQuestsForPlayerCount(updatedPlayers.length));
    // }
    disconnect() { }
}
const initNameSpace = (io) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new Connection(avalonNameSpace, socket);
    });
};
exports.initNameSpace = initNameSpace;
