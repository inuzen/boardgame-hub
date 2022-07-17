import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    getQuests,
    getAllPlayers,
    startGame,
    isHost,
    globalVote,
    selectMissedVotes,
    selectRole,
    confirmParty,
    isCurrentLeader,
    questVote,
    shouldShowVoteButtons,
    selectSecretInfo,
} from './store/avalonSlice';
import { QuestItem } from './Components/QuestItem';
import { PlayerItem } from './Components/PlayerItem';
import './avalon.scss';
import classNames from 'classnames';
import { DEFAULT_ROLES, ROLE_LIST } from './store/types';
import { RoleCheckbox } from './Components/RoleCheckbox';

const Avalon = ({ roomCode }: any) => {
    const dispatch = useAppDispatch();

    const players = useAppSelector(getAllPlayers);
    const quests = useAppSelector(getQuests);
    const host = useAppSelector(isHost);
    const missedVotes = useAppSelector(selectMissedVotes);
    const role = useAppSelector(selectRole);
    const secretInfo = useAppSelector(selectSecretInfo);
    const isLeader = useAppSelector(isCurrentLeader);

    const nickname = useAppSelector((state: any) => state.app.nickname);

    const gameMessage = useAppSelector((state) => state.avalon.gameMessage);
    const nominationInProgress = useAppSelector((state) => state.avalon.nominationInProgress);
    const globalVoteInProgress = useAppSelector((state) => state.avalon.globalVoteInProgress);
    const questVoteInProgress = useAppSelector((state) => state.avalon.questVoteInProgress);
    const gameStarted = useAppSelector((state) => state.avalon.gameInProgress);
    const showVoteControls = useAppSelector(shouldShowVoteButtons);
    const gameOverInfo = useAppSelector((state) => state.avalon.gameOverInfo);
    const enoughPlayersNominated = useAppSelector(
        (state) =>
            state.avalon.players.filter((p) => p.nominated).length ===
            // @ts-ignore
            state.avalon.quests.find((q) => q.active)?.questPartySize,
    );

    // TODO add additional rules where quest could be selected by leader

    const onStartGame = () => {
        dispatch(startGame());
    };

    const voteYes = () => {
        if (globalVoteInProgress) {
            dispatch(globalVote('yes'));
        }
        if (questVoteInProgress) {
            dispatch(questVote('yes'));
        }
    };

    const voteNo = () => {
        if (globalVoteInProgress) {
            dispatch(globalVote('no'));
        }
        if (questVoteInProgress) {
            dispatch(questVote('no'));
        }
    };

    const onConfirmParty = () => {
        dispatch(confirmParty());
    };

    return (
        <div>
            <h1>Avalon: Room id - {roomCode}.</h1>
            <h3>Name: {nickname}</h3>
            <div className="mainContainer">
                {host && !gameStarted && (
                    <div className="adminActions">
                        <button onClick={onStartGame} disabled={players?.length < 2}>
                            Start game
                        </button>
                        <div className="addRolesWrapper">
                            {Object.values(ROLE_LIST)
                                .filter((role) => !DEFAULT_ROLES.includes(role))
                                .map((roleName) => (
                                    <RoleCheckbox roleKey={roleName} />
                                ))}
                        </div>
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
                {gameOverInfo && <div>{`Game is over and ${gameOverInfo.goodWon ? 'Good' : 'Evil'} won!`}</div>}
                <div className="gameFieldContainer">
                    <div>Current Leader: {players.find((player) => player.isCurrentLeader)?.name}</div>
                    <div>{gameMessage}</div>
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
                    {showVoteControls && (
                        <div>
                            <button onClick={voteYes}>Yes</button>
                            <button onClick={voteNo}>No</button>
                        </div>
                    )}
                    {isLeader && nominationInProgress && (
                        <button onClick={onConfirmParty} disabled={!enoughPlayersNominated}>
                            Confirm Party
                        </button>
                    )}
                    {/* {isLeader && <button onClick={onContinue}>Continue</button>} */}
                </div>
                {role && <p>Your role is: {role}</p>}
                {secretInfo && <p>{secretInfo}</p>}
            </div>
        </div>
    );
};

export default Avalon;
