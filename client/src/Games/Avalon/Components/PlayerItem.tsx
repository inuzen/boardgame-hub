import React, { useCallback } from 'react';
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
import { FaCalendar, FaRegCalendar, FaRegCalendarCheck, FaRegCalendarTimes } from 'react-icons/fa';

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
    const questVoteInProgress = useAppSelector((state) => state.avalon.questVoteInProgress);
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

    const voteReady = votedArray.includes(socketId);
    const votedYes = showVotes && globalVote === 'yes';
    const votedNo = showVotes && globalVote === 'no';

    const renderVoteIcon = useCallback(() => {
        if (votedYes) {
            return <FaRegCalendarCheck />;
        }
        if (votedNo) {
            return <FaRegCalendarTimes />;
        }
        if (voteReady && !questVoteInProgress) {
            return <FaCalendar />;
        }
        return <FaRegCalendar />;
    }, [voteReady, votedNo, votedYes, questVoteInProgress]);

    return (
        <div className="playerItemContainer">
            <div
                className={classNames('playerItemCard', {
                    // target: targetId === socketId,
                    disconnected: !connected,
                    nominated,
                    leader: leader && !nominated,
                    selectForKill: killLicense,
                    dangerBorder: votedNo || targetId === socketId,
                    goodBorder: votedYes,
                })}
                onClick={onPlayerSelect}
            >
                <div className="infoBar">
                    <div className={classNames('infoItem', { show: voteReady || showVotes })}>
                        <IconContext.Provider
                            value={{
                                className: classNames('voteIcon', {
                                    ready: voteReady && !questVoteInProgress,
                                    good: votedYes,
                                    bad: votedNo,
                                }),
                            }}
                        >
                            {renderVoteIcon()}
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
                    {voteReady && <PlayerItemPill text="Ready" ready />}
                    {showRoles && <PlayerItemPill text={roleKey} />}
                </div>
            </div>
            <div className="name">{name}</div>
        </div>
    );
};
