import React from 'react';
import './checkBox.scss';

type CheckBoxProps = {
    id: string;
    onChange: () => void;
    checked: boolean;
    text: string;
};

export const CheckBox: React.FC<CheckBoxProps> = ({ id, onChange, checked, text }) => {
    return (
        <div>
            <input type="checkbox" id={id} onChange={onChange} checked={checked} className="customCheckbox" />
            <label htmlFor={id}>{text}</label>
        </div>
    );
};
