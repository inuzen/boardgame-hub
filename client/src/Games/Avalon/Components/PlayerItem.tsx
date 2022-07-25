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
import { RiVipCrownFill } from 'react-icons/ri';
import { BsFillBookmarkStarFill } from 'react-icons/bs';
import './styles/playerItem.scss';
import { IconContext } from 'react-icons';
// import knight from '../avatars/knight.png';

const VoteResult: React.FC<{ good?: boolean; danger?: boolean; ready?: boolean; text: string }> = ({
    good,
    danger,
    ready,
    text,
}) => {
    return (
        <div className={classNames('voteResult', { good, danger, ready })}>
            <span>{text}</span>
        </div>
    );
};

export const PlayerItem = ({ name, nominated, socketId, globalVote, imageName, roleKey, connected, order }: any) => {
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
    const admin = host === socketId;
    const leader = currentLeader === socketId;

    // TODO adjust colors of icons

    return (
        <div
            className={classNames('playerItemContainer', {
                target: targetId === socketId,
                disconnected: !connected,
                nominated,
                selectForKill: killLicense,
            })}
            onClick={onPlayerSelect}
        >
            <div className="infoBar">
                <div className={classNames('infoItem show', { show: admin })}>
                    <span>{order}</span>
                    {/* <IconContext.Provider value={{ color: 'blue', className: 'global-class-name' }}>
                        <TbKey />
                    </IconContext.Provider> */}
                </div>
                <div className={classNames('infoItem ', { show: leader })}>
                    <IconContext.Provider value={{ className: 'leaderIcon' }}>
                        <RiVipCrownFill />
                    </IconContext.Provider>
                </div>
                <div className={classNames('infoItem ', { show: nominated })}>
                    <IconContext.Provider value={{ color: 'orange', className: 'global-class-name' }}>
                        <BsFillBookmarkStarFill />
                    </IconContext.Provider>
                </div>
            </div>
            <div className="imageContainer">
                <img className="avatar" src={`${process.env.PUBLIC_URL}/avalonAvatars/${imageName}.png`} alt="" />
            </div>
            {targetId === socketId ? <VoteResult text="killed" danger /> : <div className="name">{name}</div>}
            {votedArray.includes(socketId) && <VoteResult text="Ready" ready />}
            {showVotes && <VoteResult text={globalVote} good={globalVote === 'yes'} danger={globalVote === 'no'} />}
            {showRoles && <VoteResult text={roleKey} />}
        </div>
    );
};
