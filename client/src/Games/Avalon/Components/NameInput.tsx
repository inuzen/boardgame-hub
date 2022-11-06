import React, { useState } from 'react';
import { setNickname } from '../../../app/appSlice';
import { useAppDispatch } from '../../../app/hooks';
import { Button } from '../../../Components/Button/Button';
import { Input } from '../../../Components/Input/Input';
import './styles/nameInput.scss';
type Props = {
    onSetName?: (name: string) => void;
};

// TODO style this
export const NameInput = (props: Props) => {
    const dispatch = useAppDispatch();

    const [name, setName] = useState('');
    const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };
    const onSetName = () => {
        dispatch(setNickname(name));
        props.onSetName?.(name);
    };
    return (
        <div className="nameInputWrapper">
            <p>Enter your name: </p>
            <Input value={name} onChange={handleNameInput} />
            <Button text="set name" onClick={onSetName} />
        </div>
    );
};
