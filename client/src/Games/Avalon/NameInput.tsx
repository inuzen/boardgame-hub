import React, { useState } from 'react';
import { setNickname } from '../../app/appSlice';
import { useAppDispatch } from '../../app/hooks';
type Props = {
    onSetName?: (name: string) => void;
};
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
        <div className="inputWrapper">
            <p>Enter your name </p>
            <input type="text" onChange={handleNameInput} value={name} />
            <button onClick={onSetName}>Set name</button>
        </div>
    );
};
