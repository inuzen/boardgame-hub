"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMainNameSpace = void 0;
const mainDbActions_1 = require("./mainDbActions");
class MainConnection {
    socket;
    constructor(socket) {
        this.socket = socket;
        this.socket.on('init user', async (uuid) => this.initUser(uuid));
        this.socket.on('disconnect', () => this.onDisconnect());
    }
    async initUser(uuid) {
        if (uuid) {
            const user = await (0, mainDbActions_1.getUserByUUID)(uuid);
            if (user) {
                return user;
            }
        }
        const newUser = await (0, mainDbActions_1.createUser)();
        return newUser;
    }
    onDisconnect() {
        console.log('MainConnection: onDisconnect');
    }
}
const initMainNameSpace = (io) => {
    io.on('connection', async (socket) => {
        new MainConnection(socket);
    });
};
exports.initMainNameSpace = initMainNameSpace;
