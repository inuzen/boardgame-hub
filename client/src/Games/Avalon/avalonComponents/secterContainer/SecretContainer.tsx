import React from 'react';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';
import classNames from 'classnames';
import { useState } from 'react';
import { useAppSelector } from '../../../../app/hooks';
import { selectRoleInfo } from '../../store/avalonSlice';
import './secretContainer.scss';

function SecretContainer() {
    const [showRoleInfo, setShowRoleInfo] = useState(true);

    const roleInfo = useAppSelector(selectRoleInfo);

    const onToggleRoleInfo = () => {
        setShowRoleInfo(!showRoleInfo);
    };

    if (!roleInfo.roleName) return null;

    return (
        <div className={classNames('secretContainer', { open: showRoleInfo })} onClick={onToggleRoleInfo}>
            <p className="secretTitleWrapper">
                <span className="showInfoButton">{showRoleInfo ? <AiFillEyeInvisible /> : <AiFillEye />}</span>
                <span className="roleInfoTitle">role info</span>
            </p>

            <div className={classNames('privateInfoWrapper', { open: showRoleInfo })}>
                <p className="secretInfoItem">
                    <span>{roleInfo.roleName}</span>
                    <span>{'  |  '}</span>
                    <span className={classNames('side', { evilSide: roleInfo.side === 'EVIL' })}>{roleInfo.side}</span>
                </p>
                {roleInfo.secretInfo && <p className="secretInfoItem">{roleInfo.secretInfo}</p>}
                <p className="secretInfoItem"> {roleInfo.description}</p>
            </div>
        </div>
    );
}

export default SecretContainer;
