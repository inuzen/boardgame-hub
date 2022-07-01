"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNameSpace = void 0;
const engine_1 = require("./engine");
const dbActions_1 = require("./dbActions");
class Connection {
    socket;
    ns;
    constructor(ns, socket) {
        this.socket = socket;
        this.ns = ns;
        socket.on('disconnect', () => this.disconnect());
        socket.on('disconnecting', () => this.disconnecting());
        socket.on('get roles', async (roomCode) => await this.assignRoles(roomCode));
        socket.on('room', async ({ roomCode, nickname }) => {
            socket.join(roomCode);
            await (0, dbActions_1.createRoom)(roomCode);
            await (0, dbActions_1.createPlayer)({ roomCode, socketId: socket.id, name: nickname });
            const players = await (0, dbActions_1.getPlayerList)(roomCode);
            ns.to(roomCode).emit('players', players);
        });
    }
    async disconnecting() {
        const { id } = this.socket;
        await (0, dbActions_1.findAndDeletePlayer)(id);
    }
    async assignRoles(roomCode) {
        await (0, dbActions_1.assignRoles)(roomCode);
        const updatedPlayers = await (0, dbActions_1.getPlayerList)(roomCode);
        updatedPlayers.forEach((player) => {
            // TODO include initial role message
            this.ns.to(player.socketId).emit('role', player.role);
            this.ns.to(roomCode).emit('quests', (0, engine_1.getQuestsForPlayerCount)(updatedPlayers.length));
        });
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
