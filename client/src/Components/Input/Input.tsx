import React from 'react';
import classNames from 'classnames';
import './input.scss';

type InputProps = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    value: string;
    labelText?: string;
    extraClasses?: string | string[];
    disabled?: boolean;
    error?: boolean;
};

export const Input: React.FC<InputProps> = ({
    value,
    labelText,
    onChange,
    onFocus,
    extraClasses,
    disabled = false,
    error = false,
}) => {
    return (
        <div className={classNames('inputWrapper', { error }, extraClasses)}>
            <input
                disabled={disabled}
                type="text"
                className="inputField"
                onChange={onChange}
                value={value}
                onFocus={onFocus}
            />
            {!!labelText && <label className="inputLabel">{labelText}</label>}
        </div>
    );
};
