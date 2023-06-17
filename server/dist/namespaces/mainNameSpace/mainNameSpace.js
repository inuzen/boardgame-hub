"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMainNameSpace = void 0;
// import { createUser, getUserByUUID } from './mainDbActions';
class MainConnection {
    socket;
    constructor(socket) {
        this.socket = socket;
    }
}
const initMainNameSpace = (io) => {
    io.on('connection', async (socket) => {
        new MainConnection(socket);
    });
};
exports.initMainNameSpace = initMainNameSpace;
