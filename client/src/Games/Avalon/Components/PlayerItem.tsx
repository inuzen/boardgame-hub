import React from 'react';
import classNames from 'classnames';

export const PlayerItem = ({ name, selected, isLeader, nominated, isHost, role }: any) => {
    return (
        <div className={classNames('playerItemContainer', { selected })}>
            <div className="infoBar">
                <div className={classNames('infoItem admin', { show: isHost })}></div>
                <div className={classNames('infoItem leader', { show: isLeader })}></div>
                <div className={classNames('infoItem nominated', { show: nominated })}></div>
            </div>
            <div className="imageContainer">
                <div>some image</div>
            </div>
            <div className="name">{name}</div>
            <div className="name">{role}</div>
            <div className="voteResult">voting field</div>
        </div>
    );
};
