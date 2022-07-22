import React from 'react';
import { globalVote, questVote } from '../store/avalonSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import './styles/voteStyles.scss';

type VoteComponentProps = {
    isGlobalVote: boolean;
    isQuestVote: boolean;
};

const VoteComponent: React.FC<VoteComponentProps> = ({ isGlobalVote, isQuestVote }) => {
    const dispatch = useAppDispatch();

    const voteYes = () => {
        if (isGlobalVote) {
            dispatch(globalVote('yes'));
        }
        if (isQuestVote) {
            dispatch(questVote('yes'));
        }
    };

    const voteNo = () => {
        if (isGlobalVote) {
            dispatch(globalVote('no'));
        }
        if (isQuestVote) {
            dispatch(questVote('no'));
        }
    };
    return (
        <div className="votingControls">
            <button className="voteButton good" onClick={voteYes}>
                {isGlobalVote ? 'Agree' : 'Success'}
            </button>
            <button className="voteButton danger" onClick={voteNo}>
                {isGlobalVote ? 'Disagree' : 'Fail'}
            </button>
        </div>
    );
};

export default VoteComponent;
