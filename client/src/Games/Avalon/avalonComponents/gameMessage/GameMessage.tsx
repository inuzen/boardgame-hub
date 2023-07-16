import React from 'react';
import { useAppSelector } from '../../../../app/hooks';
import './gameMessage.scss';

function GameMessage() {
    const gameMessage = useAppSelector((state) => state.avalon.gameMessage);

    return (
        <div className="gameMessageContainer">
            <span key={gameMessage} className="gameMessageText lineUp">
                {gameMessage}
            </span>
        </div>
    );
}

export default GameMessage;
