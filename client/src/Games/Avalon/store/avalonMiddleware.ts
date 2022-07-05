import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import {
    receivePlayers,
    receiveQuests,
    connectionEstablished,
    updateRoom,
    disconnect,
    assignRole,
} from './avalonSlice';
import { AvalonEvents } from './AvalonEvents';
import { AvalonRoomServer } from './types';
const avalonMiddleware: Middleware = (store) => {
    let socket: Socket;
    let roomCode: string = '';
    // TODO: check if the action is related to avalon, otherwise skip
    // TODO make reconnection possible
    // TODO make a waiting list or something for when someone tries to join a game that is already in progress
    return (next) => (action) => {
        if (!action.type.startsWith('avalon/')) {
            next(action);
        }
        const isConnectionEstablished = socket && store.getState().avalon.isConnected;

        if (!socket && action.type === AvalonEvents.START_CONNECTING) {
            roomCode = action.payload;
            socket = io(`http://${window.location.hostname}:3001/avalon`);

            socket.on('connect', () => {
                store.dispatch(connectionEstablished(socket.id));

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

            socket.on('update room', (roomData: AvalonRoomServer) => {
                store.dispatch(updateRoom(roomData));
            });

            socket.on('assigned role', (role: string) => {
                store.dispatch(assignRole(role));
            });
            socket.on('disconnect', () => {
                socket.close();
                store.dispatch(disconnect());
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
                case AvalonEvents.NOMINATE_PLAYER:
                    socket.emit('nominate player', action.payload);
                    break;
                case AvalonEvents.GLOBAL_VOTE:
                    socket.emit('global vote', action.payload);
                    break;
                case AvalonEvents.QUEST_VOTE:
                    socket.emit('quest vote', action.payload);
                    break;
                default:
                    break;
            }
        }

        next(action);
    };
};

export default avalonMiddleware;
