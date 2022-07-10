import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import Avalon from './Avalon';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startConnecting, disconnect } from './store/avalonSlice';
import { selectNickname, setNickname } from '../../app/appSlice';

const AvalonGameContainer = () => {
    const { roomCode } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const nickname = useAppSelector(selectNickname);

    const [name, setName] = useState('');

    useEffect(() => {
        if (!roomCode || roomCode.length !== 4) {
            navigate(`/`);
        }

        if (nickname) {
            dispatch(startConnecting(roomCode || ''));
        }

        return () => {
            dispatch(disconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nickname]);

    if (!nickname) {
        const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
        };
        const onSetName = () => {
            dispatch(setNickname(name));
        };
        return (
            <div className="inputWrapper">
                <p>Enter your name </p>
                <input type="text" onChange={handleNameInput} value={name} />
                <button onClick={onSetName}>Set name</button>
            </div>
        );
    }

    return <Avalon roomCode={roomCode} />;
};

export default AvalonGameContainer;
