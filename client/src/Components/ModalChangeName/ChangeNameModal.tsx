import React from 'react';
import Modal from 'react-modal';
import { NameInput } from '../../Games/Avalon/Components/NameInput';
import './changeNameModal.scss';

type ModalProps = {
    isOpen: boolean;
    onRequestClose: () => void;
    onSetName: (newName: string) => void;
};

export default function ChangeNameModal({ isOpen, onRequestClose, onSetName }: ModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="edit name"
            closeTimeoutMS={200}
            ariaHideApp={false}
            className="changeNameModal"
            style={{
                overlay: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                },
            }}
        >
            <NameInput onSetName={onSetName} />
        </Modal>
    );
}
