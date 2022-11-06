import { Server, Socket } from 'socket.io';
import { createUser, getUserByUUID } from './mainDbActions';

class MainConnection {
    socket: Socket;
    constructor(socket: Socket) {
        this.socket = socket;
    }

    // async initUser(uuid: string | null) {
    //     const findOrCreate = async () => {
    //         if (uuid) {
    //             const user = await getUserByUUID(uuid);
    //             if (user) {
    //                 return user;
    //             }
    //         }
    //         const newUser = await createUser();
    //         return newUser;
    //     };
    //     this.socket.emit('send user', await findOrCreate());
    // }
}

const initMainNameSpace = (io: Server) => {
    io.on('connection', async (socket) => {
        new MainConnection(socket);
    });
};

export { initMainNameSpace };
