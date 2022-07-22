import React from 'react';
import classNames from 'classnames';
import { useAppSelector } from '../../../app/hooks';
import { selectMissedVotes } from '../store/avalonSlice';
export const VoteTrack = () => {
    const missedVotes = useAppSelector(selectMissedVotes);
    return (
        <div className="voteTrackContainer">
            <p>Vote Track:</p>
            <div className="voteTrack">
                {[1, 2, 3, 4, 5].map((i: number) => (
                    <div
                        className={classNames('voteTrackItem', { danger: i === 5, active: i === missedVotes })}
                        key={i}
                    >
                        <span>{i}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
