import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { CheckBox } from '../../../Components/CheckBox/CheckBox';
import { toggleExtraRole } from '../store/avalonSlice';
import { ROLE_LIST } from '../store/types';

type RoleCheckboxProps = {
    roleKey: ROLE_LIST;
};
export const RoleCheckbox: React.FC<RoleCheckboxProps> = ({ roleKey }) => {
    const dispatch = useAppDispatch();
    const roleChecked = useAppSelector((state) => state.avalon.extraRoles.includes(roleKey));

    const roleKeyInLowerCase = roleKey.toLowerCase();

    const onRoleChecked = () => {
        dispatch(toggleExtraRole(roleKey));
    };
    return <CheckBox id={roleKey} onChange={onRoleChecked} checked={roleChecked} text={roleKeyInLowerCase} />;
};
