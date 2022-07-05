import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Avalon from './Avalon';
import { useAppDispatch } from '../../app/hooks';
import { startConnecting, disconnect } from './store/avalonSlice';

const AvalonGameContainer = () => {
    const { roomCode } = useParams();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(startConnecting(roomCode || ''));

        return () => {
            dispatch(disconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <Avalon roomCode={roomCode} />;
};

export default AvalonGameContainer;
