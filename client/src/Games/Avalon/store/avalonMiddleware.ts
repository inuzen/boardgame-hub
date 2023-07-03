import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import {
    receivePlayers,
    receiveQuests,
    connectionEstablished,
    updateRoom,
    assignRole,
    addPlayerToVotedList,
    gameOver,
    playerKilled,
} from './avalonSlice';
import { AvalonEvents } from './AvalonEvents';
import { AvalonRoomServer, ROLE_LIST } from './types';
import { setAction, setNotification } from '../../../app/appSlice';

const avalonMiddleware: Middleware = (store) => {
    let socket: Socket;
    let roomCode: string = '';

    // TODO make a waiting list or something for when someone tries to join a game that is already in progress
    return (next) => (action) => {
        if (!action.type.startsWith('avalon/')) {
            next(action);
        }
        const isConnectionEstablished = socket && store.getState().avalon.isConnected;

        if (!socket && action.type === AvalonEvents.START_CONNECTING) {
            roomCode = action.payload;
            if (process.env.NODE_ENV === 'production') {
                socket = io(`boardgame-hub-production.up.railway.app/avalon`, {
                    withCredentials: false,
                    extraHeaders: {
                        'my-custom-header': 'abcd',
                    },
                });
            } else {
                socket = io(`http://${window.location.hostname}:3500/avalon`);
            }

            socket.on('connect', () => {
                store.dispatch(connectionEstablished(socket.id));

                const playerUUID = localStorage.getItem('playerUUID');
                const action = store.getState().app.action;
                const params = {
                    roomCode,
                    nickname: store.getState().app.nickname,
                };

                if (action === 'create') {
                    socket.emit('init room', params);
                }

                if (action === 'join') {
                    if (playerUUID) {
                        socket.emit('get existing player', {
                            playerUUID,
                            ...params,
                        });
                    } else {
                        socket.emit('join room', params);
                    }
                }

                store.dispatch(setAction(null));
            });

            socket.on('error', (errorText) => {
                store.dispatch(setNotification({ error: true, text: errorText }));
            });

            socket.on('register', (playerUUID: string) => {
                localStorage.setItem('playerUUID', playerUUID);
            });

            socket.on('unregister', () => {
                localStorage.removeItem('playerUUID');
            });

            socket.on('players', (players: any[]) => {
                console.log('PLAYERS', players);

                store.dispatch(receivePlayers(players));
            });

            socket.on('quests', (quests: any[]) => {
                store.dispatch(receiveQuests(quests));
            });

            socket.on('update room', (roomData: AvalonRoomServer) => {
                store.dispatch(updateRoom(roomData));
            });

            socket.on(
                'assigned role',
                (secret: {
                    roleName: string;
                    roleKey: ROLE_LIST;
                    side: string;
                    secretInfo: string;
                    description: string;
                }) => {
                    store.dispatch(assignRole(secret));
                },
            );

            socket.on('player voted', (playerId: string) => {
                store.dispatch(addPlayerToVotedList(playerId));
            });

            socket.on('game over', (gameRes: any) => {
                store.dispatch(gameOver(gameRes));
            });

            socket.on('player killed', (playerId: string) => {
                store.dispatch(playerKilled(playerId));
            });

            socket.on('game locked', () => {
                alert('Unable to join - game is in progress');
                window.location.href = '/';
                socket.close();
            });

            socket.on('disconnect', () => {
                socket.close();
                // store.dispatch(disconnect());
            });
        }
        if (isConnectionEstablished) {
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
                case AvalonEvents.CONFIRM_PARTY:
                    socket.emit('confirm party');
                    break;
                case AvalonEvents.TOGGLE_EXTRA_ROLE:
                    socket.emit('toggle extra role', action.payload);
                    break;
                case AvalonEvents.ASSASSINATE:
                    socket.emit('assassinate', action.payload);
                    break;
                case AvalonEvents.CHANGE_PLAYER_NAME:
                    socket.emit('change player name', action.payload);
                    break;
                default:
                    break;
            }
        }

        next(action);
    };
};

export default avalonMiddleware;
