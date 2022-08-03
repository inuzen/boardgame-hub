import classNames from 'classnames';
import React from 'react';
import './button.scss';

type ButtonProps = {
    onClick: () => void;
    text: string;
    secondary?: boolean;
    extraClasses?: string | string[];
    disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ text, onClick, secondary, extraClasses, disabled = false }) => {
    return (
        <button disabled={disabled} className={classNames('btnBase', { secondary }, extraClasses)} onClick={onClick}>
            {text.toLowerCase()}
        </button>
    );
};
