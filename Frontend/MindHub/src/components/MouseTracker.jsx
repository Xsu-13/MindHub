import React, { useEffect, useState } from "react";
import { HubConnectionBuilder } from '@microsoft/signalr';

const MouseTracker = () => {
    const [connection, setConnection] = useState(null);
    const [remoteCursors, setRemoteCursors] = useState({});

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:5001/liveHub")
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => console.log("Connected to SignalR"))
            .catch(err => console.error("Connection error:", err));

        newConnection.on("ReceiveMousePosition", (connectionId, x, y) => {
            setRemoteCursors(prev => ({ ...prev, [connectionId]: { x, y } }));
        });

        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, []);

    useEffect(() => {
        if (!connection) return;

        const handleMouseMove = (event) => {
            connection.invoke("SendMousePosition", connection.connectionId, event.clientX, event.clientY)
                .catch(err => console.error("Send error:", err));
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [connection]);

    return (
        <div>
            {Object.keys(remoteCursors).map((id) => (
                <div key={id}
                     style={{
                         position: "absolute",
                         left: remoteCursors[id].x,
                         top: remoteCursors[id].y,
                         width: 10,
                         height: 10,
                         backgroundColor: "red",
                         borderRadius: "50%",
                         pointerEvents: "none"
                     }}
                />
            ))}
        </div>
    );
};

export default MouseTracker;
