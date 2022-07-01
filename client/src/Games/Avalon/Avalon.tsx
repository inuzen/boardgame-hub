import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNickname } from '../../app/appSlice';
import { QuestItem } from './Components/QuestItem';
import './avalon.scss';

const Avalon = (props: any) => {
    const { roomCode } = useParams();
    const [socket, setSocket] = useState<Socket | null>(null);
    // const socket = useAppSelector(selectSocket);
    // const dispatch = useAppDispatch();
    const nickname = useAppSelector(selectNickname);
    // TODO move these to redux
    const [players, setPlayers] = useState<any[]>([]);
    const [role, setRole] = useState<string>('');
    const [quests, setQuests] = useState<number[]>([]);
    // TODO add additional rules where quest could be selected by leader
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
            socket.on('role', (role: string) => {
                setRole(role);
            });
            socket.on('quests', (quests: number[]) => {
                setQuests(quests);
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
                <div className="gameFieldContainer">
                    {quests.map((quest: any, i) => (
                        <QuestItem
                            isActive={i === 0}
                            playerCount={quest.partySize}
                            key={i}
                            number={i + 1}
                            result={quest.result}
                        />
                    ))}
                </div>
                <div className="playerList">
                    <h2>Players:</h2>
                    <ul>
                        {players.map((player: any) => (
                            <li key={player.id}>{player.name}</li>
                        ))}
                    </ul>
                    {role && <p>Your role is {role}</p>}
                    <button onClick={onStartGame} disabled={players.length < 2}>
                        Start game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Avalon;
