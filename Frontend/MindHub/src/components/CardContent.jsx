import React, { useState, useEffect, useRef } from 'react';
import '../styles/CardTitle.css';
import EditableCodeBlock from './EditableCodeBlock';
import { PatchNode, GetNodeById } from '../services/urls.js';
import { HubConnectionBuilder } from '@microsoft/signalr';

export default function CardContent({nodeMapRef = null, mapId ='', initialName = '', initialCode = '', initCardId = null, lockNode = null, unlockNode = null }) {
    const [isCodeBlockVisible, setIsCodeBlockVisible] = useState(false);
    const [name, setName] = React.useState(initialName);
    const [code, setCode] = React.useState(initialCode);
    const [cardId, setCardId] = React.useState(initCardId);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        setName(initialName);
        setCardId(initCardId);
        setCode(initialCode);
    }, [initialName, initialCode, initCardId]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:5001/liveHub")
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                return newConnection.invoke("SubscribeToMap", mapId.toString())
            })
            .catch(err => console.error('Connection failed: ', err));

        if (!newConnection) return;
        newConnection.on("ReceiveNodeDescriptionUpdate", (nodeId, code) => {
            console.log("000")
            if(nodeId== cardId)
                setCode(code);
        });

        return () => {
            newConnection.off("ReceiveNodeDescriptionUpdate");
            newConnection.stop();
        };
    }, []);

    const toggleCodeBlock = async () => {
        setIsCodeBlockVisible(!isCodeBlockVisible);
        // if (!isCodeBlockVisible) {
        //     lockNode(initCardId);
        // }
        // else
        //     unlockNode(initCardId);
    };

    async function onCodeChange(code) {
        setCode(code);
        await PatchNode(cardId, { content: code });
        await updateNodeDescription(cardId, code);
    }

    const updateNodeDescription = async (nodeId, newDescription) => {
        if (!connection) return;
        try {
          console.log("updating description");
          await connection.invoke("UpdateNodeDescription", mapId.toString(), nodeId.toString(), newDescription);
        } catch (err) {
          console.error("Failed to update node description:", err);
        }
      }

    return (
        <>
            <div className='card_title'>
                <div className='card_name'>
                    {name}
                </div>
                <div className='button_content'>
                    <button className="burger_menu" onClick={toggleCodeBlock}>
                        &#9776;
                    </button>
                </div>
            </div>

            {isCodeBlockVisible && <EditableCodeBlock initialCode={code} onCodeChange={onCodeChange} />}
        </>
    );
}