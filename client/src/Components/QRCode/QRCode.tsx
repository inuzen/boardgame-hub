import React from 'react';
import Modal from 'react-modal';
import QRCode from 'react-qr-code';

type Props = {
    isQRModalVisible: boolean;
    handleClose: () => void;
};

function QRCodeModal({ isQRModalVisible, handleClose }: Props) {
    return (
        <Modal
            isOpen={isQRModalVisible}
            onRequestClose={handleClose}
            contentLabel="qr link"
            closeTimeoutMS={200}
            ariaHideApp={false}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                },
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
    );
}

export default QRCodeModal;
