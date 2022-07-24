import React, { useState } from 'react';
import Modal from 'react-modal';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    getQuests,
    getAllPlayers,
    startGame,
    isHost,
    selectRoleInfo,
    confirmParty,
    isCurrentLeader,
    shouldShowVoteButtons,
    selectSecretInfo,
} from './store/avalonSlice';
import { QuestItem } from './Components/QuestItem';
import { PlayerItem } from './Components/PlayerItem';
import './avalon.scss';
import { DEFAULT_ROLES, ROLE_LIST } from './store/types';
import { RoleCheckbox } from './Components/RoleCheckbox';

import QRCode from 'react-qr-code';
import VoteComponent from './Components/VoteComponent';
import { VoteTrack } from './Components/VoteTrack';

import { IoQrCodeSharp } from 'react-icons/io5';
import classNames from 'classnames';

const Avalon = ({ roomCode }: any) => {
    const dispatch = useAppDispatch();

    const players = useAppSelector(getAllPlayers);
    const quests = useAppSelector(getQuests);
    const host = useAppSelector(isHost);

    const roleInfo = useAppSelector(selectRoleInfo);
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

    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleClose = () => {
        setIsModalVisible(false);
    };

    // const handleCancel = () => {
    //     setIsModalVisible(false);
    // };

    // TODO add additional rules where quest could be selected by leader

    const onStartGame = () => {
        dispatch(startGame());
    };

    const onConfirmParty = () => {
        dispatch(confirmParty());
    };

    return (
        <div className="avalonWrapper">
            <div>
                <h2>Avalon</h2>
                <div className="roomInfo">
                    <div className="roomInfoItem">
                        <p>Room code:</p>
                        <p>
                            <span>{roomCode}</span>
                            <span className="qr" onClick={showModal}>
                                <IoQrCodeSharp />
                            </span>
                        </p>
                    </div>
                    <div className="roomInfoItem">
                        <p>Name:</p>
                        <p>{nickname}</p>
                    </div>
                </div>
            </div>
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
                    <VoteTrack />
                </div>
                {showVoteControls && (
                    <VoteComponent isGlobalVote={globalVoteInProgress} isQuestVote={questVoteInProgress} />
                )}
                {isLeader && nominationInProgress && (
                    <button onClick={onConfirmParty} disabled={!enoughPlayersNominated}>
                        Confirm Party
                    </button>
                )}

                {roleInfo.role && (
                    <p>
                        Your role is {roleInfo.role} (Side:
                        <span className={classNames('side', { evilSide: roleInfo.side === 'EVIL' })}>
                            {roleInfo.side})
                        </span>
                    </p>
                )}
                {secretInfo && <p>{secretInfo}</p>}
                <div className="playerListContainer">
                    <h3>Player List:</h3>
                    <div className="playerList">
                        {players?.map((player: any) => (
                            <PlayerItem key={player.socketId} {...player} />
                        ))}
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isModalVisible}
                onRequestClose={handleClose}
                contentLabel="qr link"
                closeTimeoutMS={200}
                ariaHideApp={false}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                    },
                }}
            >
                <QRCode value={window.location.href} size={200} style={{ zIndex: 100 }} />
            </Modal>
        </div>
    );
};

export default Avalon;
