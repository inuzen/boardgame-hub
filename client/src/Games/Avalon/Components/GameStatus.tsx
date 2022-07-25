import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {} from '../store/avalonSlice';

export const GameStatus = () => {
    const dispatch = useAppDispatch();
    const globalVoteInProgress = useAppSelector((state) => state.avalon.globalVoteInProgress);
    const questVoteInProgress = useAppSelector((state) => state.avalon.questVoteInProgress);
    const assassinationInProgress = useAppSelector((state) => state.avalon.assassinationInProgress);
    const nominationInProgress = useAppSelector((state) => state.avalon.nominationInProgress);

    return <div>GameStatus</div>;
};
