import React, { useEffect } from 'react';
import './styles/actionScreen.scss';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
    setNickname,
    selectNickname,
    setAction,
    setGame,
    selectGame,
    setRoomCode,
    selectRoomCode,
    createGameRoom,
} from '../app/appSlice';
import { Input } from '../Components/Input/Input';
import { Button } from '../Components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { IconContext } from 'react-icons';

type ActionScreenProps = {
    type: 'create' | 'join';
};
export const ActionScreen: React.FC<ActionScreenProps> = ({ type }) => {
    const nickname = useAppSelector(selectNickname);
    const roomCode = useAppSelector(selectRoomCode);
    const gameName = useAppSelector(selectGame);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // useEffect(() => {
    //     const keyDownHandler = (event: KeyboardEvent) => {
    //         if (event.key === 'Enter') {
    //             event.preventDefault();
    //             joinRoom();
    //         }
    //     };

    //     document.addEventListener('keydown', keyDownHandler);

    //     return () => {
    //         document.removeEventListener('keydown', keyDownHandler);
    //     };
    // }, [roomId]);

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setNickname(e.target.value));
    };

    const onRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setRoomCode(e.target.value.toUpperCase()));
    };

    const onCreateGame = (connectionType: 'player' | 'screen') => {
        dispatch(createGameRoom(connectionType));
    };

    const onGameSelect = () => {
        const newRoomId = Math.random().toString(36).substring(2, 6).toUpperCase();
        dispatch(setAction('create'));
        navigate(`/${gameName}/${newRoomId}`);
    };
    // TODO Prevent joining ongoing game. Part of the server restructure

    const joinRoom = () => {
        if (roomCode && roomCode.length === 4) {
            dispatch(setAction('join'));
            navigate(`/avalon/${roomCode}`);
        }
    };

    const onJoinGame = () => {
        // console.log('fdsaf');
    };

    const onBackButton = () => {
        navigate(-1);
    };

    const renderButtons = () => {
        if (type === 'create') {
            return (
                <>
                    <Button
                        disabled={!nickname}
                        text="create and join as a player"
                        onClick={onGameSelect}
                        extraClasses="actionScreenItem"
                    />
                    <Button
                        disabled
                        // disabled={!nickname}
                        secondary
                        text="create and join as a screen"
                        onClick={() => onCreateGame('screen')}
                        extraClasses="actionScreenItem"
                    />
                </>
            );
        } else {
            return (
                <>
                    <Button
                        disabled={!nickname || roomCode?.length !== 4}
                        text="join as a player"
                        onClick={joinRoom}
                        extraClasses="actionScreenItem"
                    />
                    <Button
                        disabled
                        // disabled={!nickname || roomCode?.length !== 4}
                        secondary
                        text="join as a screen"
                        onClick={() => onJoinGame()}
                        extraClasses="actionScreenItem"
                    />
                </>
            );
        }
    };

    return (
        <div className="actionScreenContainer">
            <span className="iconBackWrapper" onClick={onBackButton}>
                <IconContext.Provider value={{ className: 'iconBack' }}>
                    <IoArrowBack />
                </IconContext.Provider>
            </span>
            <p className="gameTitle">{gameName || ' '}</p>
            <Input
                labelText="enter your name"
                onChange={onNameChange}
                value={nickname}
                extraClasses="actionScreenItem"
            />
            {type === 'join' && (
                <Input
                    labelText="enter room code"
                    onChange={onRoomCodeChange}
                    value={roomCode}
                    extraClasses="actionScreenItem"
                />
            )}
            {renderButtons()}
        </div>
    );
};
