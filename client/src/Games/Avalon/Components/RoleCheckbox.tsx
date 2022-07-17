import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { toggleExtraRole } from '../store/avalonSlice';
import { ROLE_LIST } from '../store/types';

type RoleCheckboxProps = {
    roleKey: ROLE_LIST;
};
export const RoleCheckbox: React.FC<RoleCheckboxProps> = ({ roleKey }) => {
    const dispatch = useAppDispatch();
    const roleChecked = useAppSelector((state) => state.avalon.extraRoles.includes(roleKey));

    const onRoleChecked = () => {
        dispatch(toggleExtraRole(roleKey));
    };
    return (
        <div>
            <input type="checkbox" id={roleKey} onChange={onRoleChecked} checked={roleChecked} />
            <label htmlFor={roleKey}>{roleKey}</label>
        </div>
    );
};
