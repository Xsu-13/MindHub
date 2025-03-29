import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const RealTimeEditing = () => {
    const [connection, setConnection] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        setUser(user);
        console.log(user);
        const newConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:5001/chat')
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected!');

                    connection.on('ReceiveMessage', (user, message) => {
                        setMessages(messages => [...messages, { user, message }]);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    const sendMessage = async () => {
        if (message && connection) {
            await connection.send('SendMessage', user.username, message);
            setMessage('');
        }
    };

    return (
        <div>
            <h1>Chat</h1>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}><strong>{msg.user}:</strong> {msg.message}</div>
                ))}
            </div>
            <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default RealTimeEditing;