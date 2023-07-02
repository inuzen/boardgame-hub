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
import { FaRegCalendarCheck, FaRegCalendarTimes } from 'react-icons/fa';

import './styles/playerItem.scss';
import { IconContext } from 'react-icons';
import { avalonAvatars } from '../avalonAvatars/avalonAvatars';

const PlayerItemPill: React.FC<{ good?: boolean; danger?: boolean; ready?: boolean; text: string }> = ({
    good,
    danger,
    ready,
    text,
}) => {
    return (
        <div className={classNames('playerPill', { good, danger, ready })}>
            <span>{text}</span>
        </div>
    );
};

// TODO: type this normally
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
        // TODO check for nominated players and don't send server req if party full
        if (nominationPossible) {
            dispatch(nominatePlayer(socketId));
        }
        if (killLicense) {
            dispatch(assassinate(socketId));
        }
    };
    const admin = host === socketId;
    const leader = currentLeader === socketId;

    const votedForGood = showVotes && globalVote === 'yes';
    const votedForBad = showVotes && globalVote === 'no';

    return (
        <div className="playerItemContainer">
            <div
                className={classNames('playerItemCard', {
                    // target: targetId === socketId,
                    disconnected: !connected,
                    nominated,
                    leader: leader && !nominated,
                    selectForKill: killLicense,
                    dangerBorder: votedForBad || targetId === socketId,
                    goodBorder: votedForGood,
                })}
                onClick={onPlayerSelect}
            >
                <div className="infoBar">
                    <div className={classNames('infoItem', { show: showVotes })}>
                        <IconContext.Provider
                            value={{
                                className: classNames('voteIcon', {
                                    good: votedForGood,
                                }),
                            }}
                        >
                            {globalVote === 'yes' ? <FaRegCalendarCheck /> : <FaRegCalendarTimes />}
                        </IconContext.Provider>
                    </div>
                    <div className={classNames('infoItem', { show: leader })}>
                        <IconContext.Provider value={{ className: 'leaderIcon' }}>
                            <RiVipCrownFill />
                        </IconContext.Provider>
                    </div>
                    <div className={classNames('infoItem', { show: nominated })}>
                        <IconContext.Provider value={{ color: 'orange', className: 'global-class-name' }}>
                            <BsFillBookmarkStarFill />
                        </IconContext.Provider>
                    </div>
                </div>
                <div className="imageContainer">
                    {/* @ts-expect-error */}
                    <img className="avatar" src={avalonAvatars[imageName.toLowerCase()]} alt="" />
                </div>
                <div className="pillItemWrapper">
                    {targetId === socketId && <PlayerItemPill text="killed" danger />}
                    {votedArray.includes(socketId) && <PlayerItemPill text="Ready" ready />}
                    {showRoles && <PlayerItemPill text={roleKey} />}
                </div>
            </div>
            <div className="name">{name}</div>
        </div>
    );
};
