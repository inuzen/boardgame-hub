import React from 'react';
import classNames from 'classnames';
import './input.scss';

type InputProps = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    labelText?: string;
    extraClasses?: string | string[];
    disabled?: boolean;
};

export const Input: React.FC<InputProps> = ({ value, labelText, onChange, extraClasses, disabled = false }) => {
    return (
        <div className={classNames('inputWrapper', extraClasses)}>
            <input disabled={disabled} type="text" className="inputField" onChange={onChange} value={value} />
            {!!labelText && <label className="inputLabel">{labelText}</label>}
        </div>
    );
};
