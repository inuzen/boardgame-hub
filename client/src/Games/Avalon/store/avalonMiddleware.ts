import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { receivePlayers, receiveQuests, connectionEstablished } from './avalonSlice';
import { AvalonEvents } from './AvalonEvents';
const avalonMiddleware: Middleware = (store) => {
    let socket: Socket;
    let roomCode: string = '';
    // TODO: check if the action is related to avalon, otherwise skip
    // TODO make reconnection possible
    return (next) => (action) => {
        if (!action.type.startsWith('avalon/')) {
            next(action);
        }
        const isConnectionEstablished = socket && store.getState().avalon.isConnected;
        if (!socket && action.type === AvalonEvents.START_CONNECTING) {
            roomCode = action.payload;
            socket = io(`http://${window.location.hostname}:3001/avalon`);

            socket.on('connect', () => {
                store.dispatch(connectionEstablished());
                socket.emit('room', {
                    roomCode,
                    nickname: store.getState().app.nickname,
                });
            });

            socket.on('players', (players: any[]) => {
                store.dispatch(receivePlayers(players));
            });

            socket.on('quests', (quests: any[]) => {
                store.dispatch(receiveQuests(quests));
            });

            socket.on('update room', (room) => {
                console.log(room);
            });
        }
        if (isConnectionEstablished) {
            // add emits here
            switch (action.type) {
                case AvalonEvents.DISCONNECT:
                    socket.close();
                    break;
                case AvalonEvents.START_GAME:
                    socket.emit('start game', roomCode);
                    break;
                default:
                    break;
            }
        }

        next(action);
    };
};

export default avalonMiddleware;
