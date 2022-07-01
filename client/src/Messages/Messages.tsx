import React, { useEffect, useState } from 'react';
// import { selectSocket } from '../app/appSlice';
import { useAppSelector } from '../app/hooks';
import './messages.scss';

function Messages({ socket }: any) {
    const [messages, setMessages] = useState<Record<string, any>>({});
    // const socket = useAppSelector(selectSocket);
    useEffect(() => {
        if (socket) {
            const messageListener = (message: Record<string, any>) => {
                setMessages((prevMessages) => {
                    const newMessages = { ...prevMessages };
                    newMessages[message.id] = message;
                    return newMessages;
                });
            };

            const deleteMessageListener = (messageID: string) => {
                setMessages((prevMessages) => {
                    const newMessages = { ...prevMessages };
                    delete newMessages[messageID];
                    return newMessages;
                });
            };

            socket.on('message', messageListener);
            socket.on('deleteMessage', deleteMessageListener);
            socket.emit('getMessages');

            return () => {
                socket.off('message', messageListener);
                socket.off('deleteMessage', deleteMessageListener);
            };
        }
    }, [socket]);

    return (
        <div className="message-list">
            {[...Object.values(messages)]
                .sort((a, b) => a.time - b.time)
                .map((message) => (
                    <div
                        key={message.id}
                        className="message-container"
                        title={`Sent at ${new Date(message.time).toLocaleTimeString()}`}
                    >
                        <span className="user">{message.user.name}:</span>
                        <span className="message">{message.value}</span>
                        <span className="date">{new Date(message.time).toLocaleTimeString()}</span>
                    </div>
                ))}
        </div>
    );
}

export default Messages;
