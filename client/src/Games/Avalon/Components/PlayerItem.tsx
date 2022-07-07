import React from 'react';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCurrentLeader, nominatePlayer, selectHost, isCurrentLeader } from '../store/avalonSlice';

export const PlayerItem = ({ name, selected, nominated, socketId, globalVote }: any) => {
    const dispatch = useAppDispatch();
    const currentLeader = useAppSelector(selectCurrentLeader);

    const isLeader = useAppSelector(isCurrentLeader);
    // const globalVote = useAppSelector((state) => state.avalon.globalVote);
    const showVotes = useAppSelector((state) => state.avalon.revealVotes);
    const votedArray = useAppSelector((state) => state.avalon.votedPlayers);
    const host = useAppSelector(selectHost);

    const onPlayerSelect = () => {
        if (isLeader) {
            dispatch(nominatePlayer(socketId));
        }
    };
    return (
        <div className={classNames('playerItemContainer', { selected })} onClick={onPlayerSelect}>
            <div className="infoBar">
                <div className={classNames('infoItem admin', { show: host === socketId })}></div>
                <div className={classNames('infoItem leader', { show: currentLeader === socketId })}></div>
                <div className={classNames('infoItem nominated', { show: nominated })}></div>
            </div>
            <div className="imageContainer">
                <div>some image</div>
            </div>
            <div className="name">{name}</div>
            {votedArray.includes(socketId) && <div className="voteResult">{'Ready'}</div>}
            {showVotes && <div className="voteResult">{globalVote}</div>}
        </div>
    );
};
