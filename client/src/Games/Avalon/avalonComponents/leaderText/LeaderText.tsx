import React from 'react';
import { useAppSelector } from '../../../../app/hooks';
import { getAllPlayers } from '../../store/avalonSlice';
import './leaderText.scss';

function LeaderText() {
    const players = useAppSelector(getAllPlayers);

    return (
        <div className="leaderTextContainer">
            <span className="leaderText">Leader: {players.find((player) => player.isCurrentLeader)?.name}</span>
        </div>
    );
}

export default LeaderText;
