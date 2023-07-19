import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getAllPlayers, confirmParty, isCurrentLeader, shouldShowVoteButtons } from './store/avalonSlice';
import { PlayerItem } from './Components/PlayerItem';
import './styles/avalon.scss';
import RoomInfo from './avalonComponents/roomInfo/RoomInfo';
import VoteComponent from './Components/VoteComponent';
import { VoteTrack } from './Components/VoteTrack';

import { Button } from '../../Components/Button/Button';
import { Bars } from 'react-loader-spinner';
import { selectLoading } from '../../app/appSlice';
import AdminActions from './avalonComponents/adminActions/AdminActions';
import LeaderText from './avalonComponents/leaderText/LeaderText';
import GameMessage from './avalonComponents/gameMessage/GameMessage';
import Quests from './avalonComponents/quest/Quests';
import SecretContainer from './avalonComponents/secterContainer/SecretContainer';

const Avalon = ({ roomCode }: any) => {
    const dispatch = useAppDispatch();

    const players = useAppSelector(getAllPlayers);
    const loadingPlayers = useAppSelector(selectLoading);
    const isLeader = useAppSelector(isCurrentLeader);
    const nominationInProgress = useAppSelector((state) => state.avalon.nominationInProgress);
    const globalVoteInProgress = useAppSelector((state) => state.avalon.globalVoteInProgress);
    const questVoteInProgress = useAppSelector((state) => state.avalon.questVoteInProgress);
    const showVoteControls = useAppSelector(shouldShowVoteButtons);
    const gameOverInfo = useAppSelector((state) => state.avalon.gameOverInfo);
    const enoughPlayersNominated = useAppSelector(
        (state) =>
            state.avalon.players.filter((p) => p.nominated).length ===
            // @ts-ignore
            state.avalon.quests.find((q) => q.active)?.questPartySize,
    );

    // TODO add additional rules where quest could be selected by leader

    const onConfirmParty = () => {
        dispatch(confirmParty());
    };

    return (
        <div className="avalonWrapper">
            <div className="roomInfo">
                <RoomInfo roomCode={roomCode} />
            </div>

            <div className="mainContainer">
                <AdminActions />

                {gameOverInfo && <div>{`Game is over and ${gameOverInfo.goodWon ? 'Good' : 'Evil'} won!`}</div>}

                <div className="gameFieldContainer">
                    <LeaderText />
                    <GameMessage />
                    <Quests />
                    <VoteTrack />
                </div>

                <SecretContainer />

                <div className="playerListContainer">
                    {loadingPlayers ? (
                        <Bars
                            height="80"
                            width="80"
                            color="#da6417"
                            ariaLabel="bars-loading"
                            wrapperClass="loading"
                            visible={true}
                        />
                    ) : (
                        <div className="playerList">
                            {players?.map((player: any) => (
                                <PlayerItem key={player.socketId} {...player} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="playerActionContainer">
                {showVoteControls && (
                    <VoteComponent isGlobalVote={globalVoteInProgress} isQuestVote={questVoteInProgress} />
                )}
                {isLeader && nominationInProgress && (
                    <Button
                        secondary
                        text="confirm party"
                        onClick={onConfirmParty}
                        disabled={!enoughPlayersNominated}
                        extraClasses="confirmPartyButton"
                    />
                )}
            </div>
        </div>
    );
};

export default Avalon;
