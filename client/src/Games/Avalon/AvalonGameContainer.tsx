import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Avalon from './Avalon';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { startConnecting, disconnect } from './store/avalonSlice';
import { selectNickname, setAction, selectAction } from '../../app/appSlice';
import { NameInput } from './Components/NameInput';
import './styles/avalonContainer.scss';

const AvalonGameContainer = () => {
    const { roomCode } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const action = useAppSelector(selectAction);
    const nickname = useAppSelector(selectNickname);

    // const [name, setName] = useState('');

    useEffect(() => {
        if (!roomCode || roomCode.length !== 4) {
            navigate(`/`);
        }

        if (nickname) {
            if (!action) {
                dispatch(setAction('join'));
            }
            dispatch(startConnecting(roomCode || ''));
        }

        return () => {
            dispatch(disconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nickname]);

    // TODO add logic to handle when uuid is present but the player is not
    if (!nickname && !localStorage.getItem('nickname')) {
        return (
            <div className="classNameWrapper">
                <NameInput />
            </div>
        );
    }

    return <Avalon roomCode={roomCode} />;
};

export default AvalonGameContainer;
