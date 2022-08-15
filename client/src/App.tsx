import React, { useEffect } from 'react';

import 'normalize.css';
import './App.scss';
import { Route, Routes } from 'react-router-dom';
import Welcome from './WelcomePage/Welcome';
import AvalonGameContainer from './Games/Avalon/AvalonGameContainer';
import { ActionScreen } from './WelcomePage/ActionScreen';
import { useAppDispatch } from './app/hooks';
import { startConnecting } from './app/appSlice';

function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(startConnecting());
    }, []);
    return (
        <div className="App">
            <div className="content">
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/join" element={<ActionScreen type="join" />} />
                    <Route path="/create" element={<ActionScreen type="create" />} />
                    <Route path="/avalon/" element={<AvalonGameContainer />}>
                        <Route path=":roomCode" element={<AvalonGameContainer />} />
                    </Route>
                    <Route path="werewolf/:roomCode" element={<AvalonGameContainer />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
