import React, { useState, useEffect } from 'react';
import '../styles/CardTitle.css';
import EditableCodeBlock from './EditableCodeBlock';
import { PatchNode } from '../services/urls.js';
import { HubConnectionBuilder } from '@microsoft/signalr';

const LANGUAGE_OPTIONS = ['py', 'javascript', 'sql', 'java', 'csharp', 'php', 'go'];
const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24];

export default function CardContent({
    mapId = '',
    initialName = '',
    initialCode = '',
    initCardId = null,
    initialLanguage = 'py',
    initialFontSize = 14
}) {
    const [isCodeBlockVisible, setIsCodeBlockVisible] = useState(false);
    const [name, setName] = React.useState(initialName);
    const [code, setCode] = React.useState(initialCode);
    const [language, setLanguage] = React.useState(initialLanguage);
    const [fontSize, setFontSize] = React.useState(initialFontSize);
    const [cardId, setCardId] = React.useState(initCardId);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        setName(initialName);
        setCardId(initCardId);
        setCode(initialCode);
        setLanguage(initialLanguage || 'py');
        setFontSize(initialFontSize || 14);
    }, [initialName, initialCode, initCardId, initialLanguage, initialFontSize]);

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

    const handleLanguageChange = async (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);
        await PatchNode(cardId, {
            style: {
                fontFamily: newLanguage
            }
        });
    };

    const handleFontSizeChange = async (event) => {
        const newFontSize = Number(event.target.value);
        setFontSize(newFontSize);
        await PatchNode(cardId, {
            style: {
                fontSize: newFontSize
            }
        });
    };

    return (
        <>
            <div className='card_title'>
                <div className='card_name'>
                    <span style={{ fontSize: `${fontSize}px` }}>{name}</span>
                </div>
                <div className='button_content'>
                    <button className="burger_menu" onClick={toggleCodeBlock}>
                        &#9776;
                    </button>
                </div>
            </div>

            {isCodeBlockVisible && (
                <div className="node-editor-wrapper">
                    <div className="node-top-toolbar">
                        <div className="node-toolbar-item">
                            <label className="node-editor-label" htmlFor={`node-language-${cardId}`}>
                                Язык
                            </label>
                            <select
                                id={`node-language-${cardId}`}
                                className="node-language-select"
                                value={language}
                                onChange={handleLanguageChange}
                            >
                                {LANGUAGE_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="node-toolbar-item">
                            <label className="node-editor-label" htmlFor={`node-font-size-${cardId}`}>
                                Размер
                            </label>
                            <select
                                id={`node-font-size-${cardId}`}
                                className="node-font-size-select"
                                value={fontSize}
                                onChange={handleFontSizeChange}
                            >
                                {FONT_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>
                                        {size}px
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <EditableCodeBlock
                        initialCode={code}
                        language={language}
                        fontSize={fontSize}
                        onCodeChange={onCodeChange}
                    />
                </div>
            )}
        </>
    );
}