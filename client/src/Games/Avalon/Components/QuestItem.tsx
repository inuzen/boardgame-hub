import React from 'react';
import classnames from 'classnames';
import './styles/questItem.scss';

type QuestItemType = {
    number: number;
    isActive: boolean;
    playerCount: number;
    result: 'success' | 'fail' | null;
};

export const QuestItem: React.FC<QuestItemType> = ({ number, isActive, playerCount, result }) => {
    return (
        <div className={classnames('questItemWrapper active', result, { active: isActive })}>
            <span className="questNumber">Quest 5{number}</span>
            <span className="questPlayerCount">4{playerCount}</span>
        </div>
    );
};
