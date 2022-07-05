import React from 'react';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCurrentLeader, nominatePlayer, selectHost, isCurrentLeader } from '../store/avalonSlice';

export const PlayerItem = ({ name, selected, nominated, role, socketId }: any) => {
    const dispatch = useAppDispatch();
    const currentLeader = useAppSelector(selectCurrentLeader);
    console.log(currentLeader);

    const isLeader = useAppSelector(isCurrentLeader);

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
            <div className="voteResult">voting field</div>
        </div>
    );
};
