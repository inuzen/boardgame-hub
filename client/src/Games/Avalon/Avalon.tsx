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
    changePlayerName,
} from './store/avalonSlice';
import { QuestItem } from './Components/QuestItem';
import { PlayerItem } from './Components/PlayerItem';
import './styles/avalon.scss';
import { DEFAULT_ROLES, ROLE_LIST } from './store/types';
import { RoleCheckbox } from './Components/RoleCheckbox';

import QRCode from 'react-qr-code';
import VoteComponent from './Components/VoteComponent';
import { VoteTrack } from './Components/VoteTrack';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';
import { BiEditAlt } from 'react-icons/bi';

import { IoQrCodeSharp } from 'react-icons/io5';
import classNames from 'classnames';
import { NameInput } from './Components/NameInput';
import { Button } from '../../Components/Button/Button';
import ChangeNameModal from '../../Components/ModalChangeName/ChangeNameModal';

const Avalon = ({ roomCode }: any) => {
    const dispatch = useAppDispatch();

    const players = useAppSelector(getAllPlayers);
    const quests = useAppSelector(getQuests);
    const host = useAppSelector(isHost);

    const roleInfo = useAppSelector(selectRoleInfo);

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

    const [isQRModalVisible, setIsQRModalVisible] = useState(false);
    const [changeNameModal, setChangeNameModal] = useState(false);
    const [showRoleInfo, setShowRoleInfo] = useState(true);

    const showQRModal = () => {
        setIsQRModalVisible(true);
    };

    const handleClose = () => {
        setIsQRModalVisible(false);
    };

    const openChangeName = () => {
        setChangeNameModal(true);
    };
    const handleChangeNameClose = () => {
        setChangeNameModal(false);
    };

    // TODO add additional rules where quest could be selected by leader

    const onStartGame = () => {
        dispatch(startGame());
    };

    const onConfirmParty = () => {
        dispatch(confirmParty());
    };

    const onToggleRoleInfo = () => {
        setShowRoleInfo(!showRoleInfo);
    };

    const onSetName = (newName: string) => {
        dispatch(changePlayerName(newName));
        setChangeNameModal(false);
    };

    console.log(process.env);
    return (
        <div className="avalonWrapper">
            <div className="roomInfo">
                <div className="roomInfoItem start">
                    <span>{roomCode}</span>
                    <span className="qr" onClick={showQRModal}>
                        <IoQrCodeSharp />
                    </span>
                </div>
                <span className="gameTitle">Avalon</span>
                <div className="roomInfoItem end">
                    <span>{nickname}</span>
                    <span onClick={openChangeName}>
                        <BiEditAlt />
                    </span>
                </div>
            </div>

            <div className="mainContainer">
                {host && !gameStarted && (
                    <div className="adminActions">
                        {/* change to < 5  */}
                        <Button text="Start game" onClick={onStartGame} disabled={players?.length < 2} />
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
                    <div className="leaderTextContainer">
                        <span className="leaderText">
                            Leader: {players.find((player) => player.isCurrentLeader)?.name}
                        </span>
                    </div>
                    <div className="gameMessageContainer">
                        <span className="gameMessageText">{gameMessage}</span>
                    </div>
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

                {roleInfo.roleName && (
                    <div className={classNames('secretContainer', { open: showRoleInfo })} onClick={onToggleRoleInfo}>
                        <p className="secretTitleWrapper">
                            <span className="showInfoButton">
                                {showRoleInfo ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </span>
                            <span className="roleInfoTitle">role info</span>
                        </p>

                        <div className={classNames('privateInfoWrapper', { open: showRoleInfo })}>
                            <p className="secretInfoItem">
                                <span>role: {roleInfo.roleName}</span>
                                <span>{'  |  '}</span>
                                <span className={classNames('side', { evilSide: roleInfo.side === 'EVIL' })}>
                                    {roleInfo.side}
                                </span>
                            </p>
                            {roleInfo.secretInfo && <p className="secretInfoItem">{roleInfo.secretInfo}</p>}
                            <p className="secretInfoItem">ability: {roleInfo.description}</p>
                        </div>
                    </div>
                )}
                <div className="playerListContainer">
                    <div className="playerList">
                        {players?.map((player: any) => (
                            <PlayerItem key={player.socketId} {...player} />
                        ))}
                    </div>
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
            <Modal
                isOpen={isQRModalVisible}
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

            <ChangeNameModal isOpen={changeNameModal} onRequestClose={handleChangeNameClose} onSetName={onSetName} />
        </div>
    );
};

export default Avalon;
