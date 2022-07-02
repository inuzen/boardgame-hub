import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { receivePlayers, receiveQuests, connectionEstablished } from './avalonSlice';
// import AvalonEvent from './chatEvent';

const avalonMiddleware: Middleware = (store) => {
    let socket: Socket;
    let roomCode: string = '';
    // TODO: check if the action is related to avalon, otherwise skip
    return (next) => (action) => {
        const isConnectionEstablished = socket && store.getState().avalon.isConnected;
        if (!socket && action.type === 'avalon/startConnecting') {
            console.log('start connecting');
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
        }
        if (isConnectionEstablished) {
            // add emits here
            switch (action.type) {
                case 'avalon/disconnect':
                    socket.close();
                    break;
                case 'avalon/startGame':
                    socket.emit('get roles', roomCode);
                    break;
                default:
                    break;
            }
        }

        next(action);
    };
};

export default avalonMiddleware;
