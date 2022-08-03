import React from 'react';
import { useLocation } from 'react-router-dom';

type LocationProps = {
    state: {
        foo: 'bar';
    };
};
export const JoinScreen = (props: any) => {
    // const { state } = useLocation() as LocationProps;

    return <div>Join Screen</div>;
};
