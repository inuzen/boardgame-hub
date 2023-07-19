import React from 'react';
import { IoQrCodeSharp } from 'react-icons/io5';
import { useState } from 'react';
import { BiEditAlt } from 'react-icons/bi';
import { useAppSelector, useAppDispatch } from '../../../../app/hooks';
import { changePlayerName } from '../../store/avalonSlice';
import ChangeNameModal from '../../../../Components/ModalChangeName/ChangeNameModal';
import QRCodeModal from '../../../../Components/QRCode/QRCode';
import './roomInfo.scss';

type roomInfoProps = {
    roomCode: any;
};

function RoomInfo({ roomCode }: roomInfoProps) {
    const [isQRModalVisible, setIsQRModalVisible] = useState(false);
    const [changeNameModal, setChangeNameModal] = useState(false);

    const dispatch = useAppDispatch();
    const nickname = useAppSelector((state: any) => state.app.nickname);

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

    const onSetName = (newName: string) => {
        dispatch(changePlayerName(newName));
        setChangeNameModal(false);
    };

    return (
        <>
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

            <QRCodeModal isQRModalVisible={isQRModalVisible} handleClose={handleClose} />

            <ChangeNameModal isOpen={changeNameModal} onRequestClose={handleChangeNameClose} onSetName={onSetName} />
        </>
    );
}

export default RoomInfo;
