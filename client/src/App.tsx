import React, { useEffect, useState } from 'react';

import './App.css';

import { Route, Routes } from 'react-router-dom';
import Welcome from './WelcomePage/Welcome';
import AvalonGameContainer from './Games/Avalon/AvalonGameContainer';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="avalon/" element={<AvalonGameContainer />}>
                    <Route path=":roomCode" element={<AvalonGameContainer />} />
                </Route>
                <Route path="werewolf/:roomCode" element={<AvalonGameContainer />} />
            </Routes>
        </div>
    );
}

export default App;
