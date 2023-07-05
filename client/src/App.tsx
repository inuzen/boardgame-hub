import React, { useEffect } from 'react';
// components
import { Route, Routes } from 'react-router-dom';
import Welcome from './WelcomePage/Welcome';
import AvalonGameContainer from './Games/Avalon/AvalonGameContainer';
import { ActionScreen } from './WelcomePage/ActionScreen';
import toast, { Toaster } from 'react-hot-toast';

// styles
import 'normalize.css';
import './App.scss';

// store
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectNotification, setNotification } from './app/appSlice';

function App() {
    const dispatch = useAppDispatch();
    const notification = useAppSelector(selectNotification);
    useEffect(() => {
        if (notification) {
            if (notification.error) {
                toast.error(notification.text, { duration: 2000, position: 'top-right' });
            } else {
                toast.success(notification.text, { duration: 2000, position: 'top-right' });
            }
            dispatch(setNotification(null));
        }
    }, [notification, dispatch]);
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
            <Toaster />
        </div>
    );
}

export default App;
