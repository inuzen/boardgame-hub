import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNickname } from '../../app/appSlice';

const Avalon = (props: any) => {
    const { roomCode } = useParams();
    const [socket, setSocket] = useState<Socket | null>(null);
    // const socket = useAppSelector(selectSocket);
    // const dispatch = useAppDispatch();
    const nickname = useAppSelector(selectNickname);
    const [players, setPlayers] = useState<any[]>([]);

    useEffect(() => {
        const newSocket = io(`http://${window.location.hostname}:3001/avalon`);
        setSocket(newSocket);

        if (roomCode) {
            newSocket.emit('room', { roomCode, nickname });
        }
        // newSocket.emit('get players', roomCode);
        return () => {
            newSocket.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('players', (data: any[]) => {
                setPlayers(data);
            });
        }
    }, [socket]);
    const onStartGame = () => {
        socket?.emit('get roles', roomCode);
    };
    return (
        <div>
            <h1>Avalon: Room id - {roomCode}</h1>
            <div className="mainContainer">
                <div className="playerList">
                    <ul>
                        {players.map((player: any) => (
                            <li key={player.id}>
                                {player.name} - {player.role}
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={onStartGame} disabled={players.length < 2}>
                    Start game
                </button>
                <div className="gameContainer">
                    <p className="statusText">currentQuest</p>
                    <p className="statusText">currentLeader</p>
                </div>
            </div>
        </div>
    );
};

export default Avalon;
