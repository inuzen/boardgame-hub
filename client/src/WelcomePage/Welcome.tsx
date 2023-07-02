import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { setGame } from '../app/appSlice';

import './welcome.scss';
import { Button } from '../Components/Button/Button';

const Welcome = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setGame(null));
        const getstuff = async () => {
            const response = await fetch('https://boardgame-hub.railway.internal/foobar', { method: 'GET' });
            return response;
        };
        const stuff = getstuff();
        console.log(JSON.stringify(stuff));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onJoinRoom = () => {
        navigate('/join');
    };

    const availableGames = ['avalon', 'werewolf'];

    const onCreateRoom = (gameTitle: string) => {
        dispatch(setGame(gameTitle));
        navigate('/create');
    };

    return (
        <div className="welcomeScreenContainer">
            <h2 className="welcomeTitle">welcome to boardgame hub!</h2>
            <div className="joinButtonWrapper">
                <Button text="join game" onClick={onJoinRoom} />
            </div>
            <div className="createButtonsContainer">
                <span className="createGameMsg">Or create a game from the list: </span>
                <div className="gameList">
                    {availableGames.map((game) => (
                        <Button key={game} secondary text={game} onClick={() => onCreateRoom(game)} />
                    ))}
                </div>
                <Button
                    text={go}
                    onClick={() => {
                        window.location.href;
                    }}
                />
            </div>
        </div>
    );
};

export default Welcome;
