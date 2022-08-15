import { Server, Socket } from 'socket.io';
import { createUser, getUserByUUID } from './mainDbActions';

class MainConnection {
    socket: Socket;
    constructor(socket: Socket) {
        this.socket = socket;

        this.socket.on('init user', async (uuid: string | null) => this.initUser(uuid));
        this.socket.on('disconnect', () => this.onDisconnect());
    }

    async initUser(uuid: string | null) {
        const findOrCreate = async () => {
            if (uuid) {
                const user = await getUserByUUID(uuid);
                if (user) {
                    return user;
                }
            }
            const newUser = await createUser();
            return newUser;
        };
        this.socket.emit('send user', await findOrCreate());
    }

    onDisconnect() {
        console.log('MainConnection: onDisconnect');
    }
}

const initMainNameSpace = (io: Server) => {
    io.on('connection', async (socket) => {
        new MainConnection(socket);
    });
};

export { initMainNameSpace };
