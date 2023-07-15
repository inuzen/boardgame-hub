import { Server, Socket } from 'socket.io';
// import { createUser, getUserByUUID } from './mainDbActions';

class MainConnection {
    socket: Socket;
    constructor(socket: Socket) {
        this.socket = socket;
    }
}

const initMainNameSpace = (io: Server) => {
    io.on('connection', async (socket) => {
        new MainConnection(socket);
    });
};

export { initMainNameSpace };
