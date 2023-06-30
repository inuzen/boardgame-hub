import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { toggleExtraRole } from '../store/avalonSlice';
import { ROLE_LIST } from '../store/types';
import './styles/roleCheckBox.scss';

type RoleCheckboxProps = {
    roleKey: ROLE_LIST;
};
export const RoleCheckbox: React.FC<RoleCheckboxProps> = ({ roleKey }) => {
    const dispatch = useAppDispatch();
    const roleChecked = useAppSelector((state) => state.avalon.extraRoles.includes(roleKey));

    const lastLetters = roleKey.slice(1).toLowerCase();
    const roleKeyInLowerCase = roleKey.charAt(0) + lastLetters;

    const onRoleChecked = () => {
        dispatch(toggleExtraRole(roleKey));
    };
    return (
        <div>
            <input
                type="checkbox"
                id={roleKey}
                onChange={onRoleChecked}
                checked={roleChecked}
                className="customCheckbox"
            />
            <label htmlFor={roleKey}>{roleKeyInLowerCase}</label>
        </div>
    );
};
