import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startConnecting, getQuests, getAllPlayers, disconnect, startGame } from './store/avalonSlice';
import { QuestItem } from './Components/QuestItem';
import { PlayerItem } from './Components/PlayerItem';
import './avalon.scss';

const Avalon = (props: any) => {
    const { roomCode } = useParams();

    const dispatch = useAppDispatch();

    const players = useAppSelector(getAllPlayers);
    const quests = useAppSelector(getQuests);
    console.log(quests);

    // TODO add additional rules where quest could be selected by leader
    useEffect(() => {
        dispatch(startConnecting(roomCode || ''));

        return () => {
            dispatch(disconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onStartGame = () => {
        dispatch(startGame());
    };
    return (
        <div>
            <h1>Avalon: Room id - {roomCode}</h1>
            <div className="mainContainer">
                <div className="playerListContainer">
                    <h2>Players:</h2>
                    <div className="playerList">
                        {players.map((player: any) => (
                            <PlayerItem key={player.socketId} {...player} />
                        ))}
                    </div>

                    <button onClick={onStartGame} disabled={players.length < 2}>
                        Start game
                    </button>
                </div>
                <div className="gameFieldContainer">
                    <p>Current Leader: {}</p>
                    <div className="questContainer">
                        {quests.map(({ active, questNumber, questPartySize, questResult }: any, i) => (
                            <QuestItem
                                isActive={active}
                                playerCount={questPartySize}
                                key={i}
                                number={questNumber}
                                result={questResult}
                            />
                        ))}
                    </div>
                    <p>Vote Track:</p>
                    <div className="voteTrack">
                        {[1, 2, 3, 4, 5].map((i: number) => (
                            <div className="voteTrackItem" key={i}>
                                {i}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Avalon;
