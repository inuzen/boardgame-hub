import React, { useEffect, useState } from 'react';

import './App.css';
import { Route, Routes } from 'react-router-dom';
import Welcome from './WelcomePage/Welcome';
import Avalon from './Games/Avalon/Avalon';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="avalon/:roomCode" element={<Avalon />} />
                <Route path="werewolf/:roomCode" element={<Avalon />} />
            </Routes>
        </div>
    );
}

export default App;
