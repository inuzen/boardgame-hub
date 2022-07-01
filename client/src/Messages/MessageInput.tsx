import React, { useState } from 'react';
// import { selectSocket } from '../app/appSlice';
import { useAppSelector } from '../app/hooks';
import './messages.scss';

const NewMessage = ({ socket }: any) => {
    const [value, setValue] = useState('');
    // const socket = useAppSelector(selectSocket);
    const submitForm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (socket) {
            socket.emit('message', value);
        }
        setValue('');
    };

    return (
        <form onSubmit={submitForm}>
            <input
                autoFocus
                value={value}
                placeholder="Type your message"
                onChange={(e) => {
                    setValue(e.currentTarget.value);
                }}
            />
        </form>
    );
};

export default NewMessage;
