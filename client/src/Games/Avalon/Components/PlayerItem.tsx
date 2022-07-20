import React from 'react';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
    selectCurrentLeader,
    nominatePlayer,
    selectHost,
    canNominate,
    canKill,
    selectTarget,
    assassinate,
} from '../store/avalonSlice';

export const PlayerItem = ({ name, nominated, socketId, globalVote, role, connected }: any) => {
    const dispatch = useAppDispatch();
    const currentLeader = useAppSelector(selectCurrentLeader);

    const nominationPossible = useAppSelector(canNominate);
    const killLicense = useAppSelector(canKill);
    const targetId = useAppSelector(selectTarget);
    // const globalVote = useAppSelector((state) => state.avalon.globalVote);
    const showVotes = useAppSelector((state) => state.avalon.revealVotes);
    const showRoles = useAppSelector((state) => state.avalon.revealRoles);
    const votedArray = useAppSelector((state) => state.avalon.votedPlayers);
    const host = useAppSelector(selectHost);

    const onPlayerSelect = () => {
        // TODO check for partySize
        if (nominationPossible) {
            dispatch(nominatePlayer(socketId));
        }
        if (killLicense) {
            dispatch(assassinate(socketId));
        }
    };
    return (
        <div
            className={classNames('playerItemContainer', { target: targetId === socketId, disconnected: !connected })}
            onClick={onPlayerSelect}
        >
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
            {showRoles && <div className="voteResult">{role}</div>}
        </div>
    );
};
