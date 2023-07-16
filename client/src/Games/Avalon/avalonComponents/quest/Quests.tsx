import React from 'react';
import { QuestItem } from '../../Components/QuestItem';
import { getQuests } from '../../store/avalonSlice';
import { useAppSelector } from '../../../../app/hooks';
import './quests.scss';

function Quests() {
    const quests = useAppSelector(getQuests);

    return (
        <div className="questContainer">
            {quests.map(({ active, questNumber, questPartySize, questResult }: any, i) => (
                <QuestItem
                    isActive={active}
                    playerCount={questPartySize}
                    key={i}
                    number={questNumber}
                    result={questResult}
                />
            ))}
        </div>
    );
}

export default Quests;
