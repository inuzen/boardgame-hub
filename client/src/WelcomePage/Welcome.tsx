import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setNickname, selectNickname } from '../app/appSlice';

import './welcome.scss';

const Welcome = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [showGames, setShowGames] = useState(false);
    const nickname = useAppSelector(selectNickname);

    const dispatch = useAppDispatch();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomId(e.target.value);
    };

    const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setNickname(e.target.value));
    };

    const onJoinRoom = () => {
        if (roomId) {
            navigate(`/avalon/${roomId}`);
        }
    };

    const avaliableGames = ['avalon', 'werewolf'];

    const onCreateRoom = () => {
        setShowGames(true);
    };

    const onGameSelect = (e: any) => {
        const newRoomId = Math.random().toString(36).substring(2, 6);
        navigate(`/${e.target.name}/${newRoomId}`);
    };

    return (
        <div>
            <h1>Welcome to Boardgame Hub!</h1>

            <div className="welcomeContainer">
                <div className="inputWrapper">
                    <p>Enter your name </p>
                    <input type="text" onChange={handleNameInput} value={nickname} />
                </div>

                <p>What would you like to do?</p>
                <div className="actionContainer">
                    <button onClick={onCreateRoom} disabled={!nickname}>
                        Create a room
                    </button>
                    <span>OR</span>
                    <div>
                        <input type="text" onChange={handleInput} />
                        <button disabled={!nickname} onClick={onJoinRoom}>
                            Join room
                        </button>
                    </div>
                </div>

                {showGames && (
                    <div className="gameList">
                        <p>Please select a game</p>
                        {avaliableGames.map((game) => (
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
