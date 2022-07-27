import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setNickname, selectNickname, setAction } from '../app/appSlice';

import './welcome.scss';

const Welcome = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [showGames, setShowGames] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const nickname = useAppSelector(selectNickname);

    const dispatch = useAppDispatch();

    // TODO Fix join button
    const joinRoom = () => {
        if (showCode && roomId && roomId.length === 4) {
            dispatch(setAction('join'));
            navigate(`/avalon/${roomId}`);
        }
    };

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                joinRoom();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, [roomId]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomId(e.target.value.toUpperCase());
    };

    const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setNickname(e.target.value));
    };

    const onJoinRoom = () => {
        joinRoom();
    };

    const availableGames = ['avalon', 'werewolf'];

    const onCreateRoom = () => {
        setShowCode(false);
        setShowGames(true);
    };

    const onSelectJoin = () => {
        setShowGames(false);
        setShowCode(true);
    };

    const onGameSelect = (e: any) => {
        const newRoomId = Math.random().toString(36).substring(2, 6).toUpperCase();
        dispatch(setAction('create'));
        navigate(`/${e.target.name}/${newRoomId}`);
    };

    return (
        <div>
            <h2>welcome to boardgame hub!</h2>

            <div className="welcomeContainer">
                <div className="inputWrapper">
                    <p>please, enter your name: </p>
                    <input type="text" onChange={handleNameInput} value={nickname} />
                </div>

                <div className="choiceContainer">
                    {/* <p className="choiceText">what would you like to do?</p> */}
                    <div className="choiceActions">
                        <button className="choiceButton" onClick={onCreateRoom} disabled={!nickname}>
                            create
                        </button>
                        <span>OR</span>
                        <button className="choiceButton" disabled={!nickname} onClick={onSelectJoin}>
                            join
                        </button>
                    </div>
                </div>
                {showCode && (
                    <div>
                        <p>enter room code</p>
                        <input type="text" onChange={handleInput} value={roomId} />
                        <button onClick={onJoinRoom} disabled={roomId.length !== 4}>
                            join
                        </button>
                    </div>
                )}

                {showGames && (
                    <div className="gameList">
                        <p>Please select a game</p>
                        {availableGames.map((game) => (
                            <button name={game} key={game} onClick={onGameSelect}>
                                {game}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Welcome;
