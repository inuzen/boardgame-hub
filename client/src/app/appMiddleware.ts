import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { AppEvents } from './appEvents';
import { connectionEstablished, userReceived } from './appSlice';

const avalonMiddleware: Middleware = (store) => {
    let socket: Socket;

    // TODO make a waiting list or something for when someone tries to join a game that is already in progress
    return (next) => (action) => {
        if (!action.type.startsWith('app/')) {
            next(action);
        }

        const isConnectionEstablished = socket && store.getState().app.isConnected;

        if (!socket && action.type === AppEvents.START_CONNECTING) {
            // socket = io(`https://boardgame-hub-server.herokuapp.com/avalon`, {
            //     withCredentials: false,
            //     extraHeaders: {
            //         'my-custom-header': 'abcd',
            //     },
            // });
            socket = io(`http://${window.location.hostname}:3001/`);

            socket.on('connect', () => {
                store.dispatch(connectionEstablished(socket.id));

                const playerUUID = localStorage.getItem('playerUUID');

                socket.emit('init user', playerUUID || null);
            });

            socket.on('send user', (user) => {
                store.dispatch(userReceived(user));
            });

            socket.on('register uuid', (playerUUID: string) => {
                console.log(playerUUID);

                localStorage.setItem('playerUUID', playerUUID);
            });

            socket.on('unregister', () => {
                localStorage.removeItem('playerUUID');
            });

            socket.on('disconnect', () => {
                socket.close();
            });
        }
        if (isConnectionEstablished) {
            switch (action.type) {
                default:
                    break;
            }
        }

        next(action);
    };
};

export default avalonMiddleware;
