import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    getQuests,
    getAllPlayers,
    startGame,
    isHost,
    onVote,
    selectMissedVotes,
    selectRole,
    confirmParty,
} from './store/avalonSlice';
import { QuestItem } from './Components/QuestItem';
import { PlayerItem } from './Components/PlayerItem';
import './avalon.scss';
import classNames from 'classnames';

const Avalon = ({ roomCode }: any) => {
    const dispatch = useAppDispatch();

    const players = useAppSelector(getAllPlayers);
    const quests = useAppSelector(getQuests);
    const host = useAppSelector(isHost);
    const missedVotes = useAppSelector(selectMissedVotes);
    const role = useAppSelector(selectRole);
    const foo = useAppSelector((state) => state.avalon.nominationInProgress);
    console.log(foo);

    // TODO add additional rules where quest could be selected by leader

    const onStartGame = () => {
        dispatch(startGame());
    };

    const voteYes = () => {
        onVote('yes');
    };

    const voteNo = () => {
        onVote('no');
    };

    const onConfirmParty = () => {};

    return (
        <div>
            <h1>Avalon: Room id - {roomCode}</h1>
            <div className="mainContainer">
                {host && (
                    <div className="adminActions">
                        <button onClick={onStartGame} disabled={players?.length < 2}>
                            Start game
                        </button>
                    </div>
                )}
                <div className="playerListContainer">
                    <h2>Players:</h2>
                    <div className="playerList">
                        {players?.map((player: any) => (
                            <PlayerItem key={player.socketId} {...player} />
                        ))}
                    </div>
                </div>
                <div className="gameFieldContainer">
                    <p>Current Leader: {players.find((player) => player.isCurrentLeader)?.name}</p>
                    <p>Vote in Progress: {useAppSelector((state) => state.avalon.votingInProgress).toString()}</p>
                    <p>
                        Nomination in progress:{' '}
                        {useAppSelector((state) => state.avalon.nominationInProgress).toString()}
                    </p>
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
                            <div
                                className={classNames('voteTrackItem', { danger: i === 5, active: i === missedVotes })}
                                key={i}
                            >
                                {i}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <button onClick={voteYes}>Yes</button>
                    <button onClick={voteNo}>No</button>
                    <button onClick={voteNo}>Confirm Party</button>
                </div>
                {role && <p>Your role is: {role}</p>}
            </div>
        </div>
    );
};

export default Avalon;
