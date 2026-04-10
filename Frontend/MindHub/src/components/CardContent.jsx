import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/CardTitle.css';
import EditableCodeBlock from './EditableCodeBlock';
import { CreateStyle, PatchNode, PatchStyle } from '../services/urls.js';
import { HubConnectionBuilder } from '@microsoft/signalr';

const LANGUAGE_OPTIONS = ['py', 'javascript', 'sql', 'java', 'csharp', 'php', 'go'];
const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24];
const COLOR_OPTIONS = ['#7C3AED', '#A855F7', '#EC4899', '#F43F5E', '#FB923C', '#F59E0B', '#EAB308', '#84CC16'];

export default function CardContent({
    mapId = '',
    initialName = '',
    initialCode = '',
    initCardId = null,
    initialLanguage = 'py',
    initialFontSize = 14,
    initialBackgroundColor = '#FFFFFF',
    initialStyleId = null,
    onNodeColorChange = null,
    onNodeStyleChange = null,
    onNodeFontSizeChange = null
}) {
    const [isCodeBlockVisible, setIsCodeBlockVisible] = useState(false);
    const [name, setName] = React.useState(initialName);
    const [code, setCode] = React.useState(initialCode);
    const [language, setLanguage] = React.useState(initialLanguage);
    const [fontSize, setFontSize] = React.useState(initialFontSize);
    const [selectedColor, setSelectedColor] = React.useState(initialBackgroundColor);
    const [cardId, setCardId] = React.useState(initCardId);
    const [styleId, setStyleId] = React.useState(initialStyleId);
    const [connection, setConnection] = useState(null);
    const [toolbarPosition, setToolbarPosition] = useState(null);
    const initializedNodeIdRef = useRef(null);
    const titleRef = useRef(null);
    const toolbarRoot = useMemo(() => document.body, []);

    useEffect(() => {
        if (initializedNodeIdRef.current === initCardId) return;
        setName(initialName);
        setCardId(initCardId);
        setCode(initialCode);
        setLanguage(initialLanguage || 'py');
        setFontSize(initialFontSize || 14);
        setSelectedColor(initialBackgroundColor || '#FFFFFF');
        setStyleId(initialStyleId);
        initializedNodeIdRef.current = initCardId;
    }, [initialName, initialCode, initCardId, initialLanguage, initialFontSize, initialBackgroundColor, initialStyleId]);

    const patchStyleSafe = async (patch) => {
        let resolvedStyleId = styleId;

        if (!resolvedStyleId) {
            const createdStyleResponse = await CreateStyle({
                backgroundColor: selectedColor,
                textColor: '#353535',
                borderColor: '#C94A46',
                fontSize: fontSize,
                fontFamily: language
            });
            resolvedStyleId = createdStyleResponse?.data?.id;
            if (!resolvedStyleId) {
                throw new Error('Не удалось создать стиль для ноды');
            }
            setStyleId(resolvedStyleId);
            await PatchNode(cardId, { styleId: resolvedStyleId });
        }

        await PatchStyle(resolvedStyleId, patch);
    };

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
        await patchStyleSafe({ fontFamily: newLanguage });
        if (onNodeStyleChange) {
            onNodeStyleChange(cardId, { fontFamily: newLanguage });
        }
    };

    const handleFontSizeChange = async (event) => {
        const newFontSize = Number(event.target.value);
        const previousFontSize = fontSize;
        setFontSize(newFontSize);
        await patchStyleSafe({ fontSize: newFontSize });
        if (onNodeStyleChange) {
            onNodeStyleChange(cardId, { fontSize: newFontSize });
        }
        if (onNodeFontSizeChange) {
            onNodeFontSizeChange(cardId, newFontSize, previousFontSize);
        }
    };

    const handleColorChange = async (color) => {
        setSelectedColor(color);
        if (onNodeColorChange) {
            onNodeColorChange(cardId, color);
        }
        await patchStyleSafe({ backgroundColor: color });
        if (onNodeStyleChange) {
            onNodeStyleChange(cardId, { backgroundColor: color });
        }
    };

    useEffect(() => {
        if (!isCodeBlockVisible) {
            setToolbarPosition(null);
            return;
        }

        const updateToolbarPosition = () => {
            if (!titleRef.current) return;
            const rect = titleRef.current.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
            setToolbarPosition({
                top: Math.max(8, rect.top - 52),
                left: rect.left
            });
        };

        updateToolbarPosition();
        const intervalId = window.setInterval(updateToolbarPosition, 120);
        window.addEventListener('resize', updateToolbarPosition);
        window.addEventListener('scroll', updateToolbarPosition, true);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('resize', updateToolbarPosition);
            window.removeEventListener('scroll', updateToolbarPosition, true);
        };
    }, [isCodeBlockVisible]);

    return (
        <>
            <div className='card_title'>
                <div className='card_name'>
                    <span ref={titleRef} style={{ fontSize: `${fontSize}px` }}>{name}</span>
                </div>
                <div className='button_content'>
                    <button className="burger_menu" onClick={toggleCodeBlock}>
                        &#9776;
                    </button>
                </div>
            </div>

            {isCodeBlockVisible && (
                <div className="node-editor-wrapper">
                    <EditableCodeBlock
                        initialCode={code}
                        language={language}
                        fontSize={fontSize}
                        onCodeChange={onCodeChange}
                    />
                </div>
            )}
            {isCodeBlockVisible && toolbarPosition && createPortal(
                <div
                    className="floating-node-toolbar"
                    style={{ top: `${toolbarPosition.top}px`, left: `${toolbarPosition.left}px` }}
                >
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
                    <div className="node-color-palette">
                        {COLOR_OPTIONS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color)}
                                title={`Цвет ${color}`}
                            />
                        ))}
                    </div>
                </div>,
                toolbarRoot
            )}
        </>
    );
}