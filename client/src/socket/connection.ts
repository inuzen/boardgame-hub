import { io, Socket } from 'socket.io-client';

// const socket = io(`https://boardgame-hub-server.herokuapp.com/avalon`, {
//     withCredentials: false,
//     extraHeaders: {
//         'my-custom-header': 'abcd',
//     },
// });

class SocketConnection {
    private socket: Socket;

    constructor() {
        this.socket = io(`http://${window.location.hostname}:3001/`);
    }

    public connectToNamespace(namespace: string): void {
        this.socket = io(`/${namespace}`);
    }

    public getSocket(): Socket {
        return this.socket;
    }
}

const Connection = new SocketConnection();

export { Connection };
