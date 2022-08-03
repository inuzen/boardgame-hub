import React, { useEffect, useState } from 'react';

import 'normalize.css';
import './App.scss';
import { Route, Routes, useLocation } from 'react-router-dom';
import Welcome from './WelcomePage/Welcome';
import AvalonGameContainer from './Games/Avalon/AvalonGameContainer';
import { ActionScreen } from './WelcomePage/ActionScreen';

function App() {
    const location = useLocation();
    return (
        <div className="App">
            <div className="content">
                {/* <TransitionGroup>
                    <CSSTransition timeout={300} classNames="right-to-left" key={location.key}> */}
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/join" element={<ActionScreen type="join" />} />
                    <Route path="/create" element={<ActionScreen type="create" />} />
                    <Route path="avalon/" element={<AvalonGameContainer />}>
                        <Route path=":roomCode" element={<AvalonGameContainer />} />
                    </Route>
                    <Route path="werewolf/:roomCode" element={<AvalonGameContainer />} />
                </Routes>
                {/* </CSSTransition>
                </TransitionGroup> */}
            </div>
        </div>
    );
}

export default App;
