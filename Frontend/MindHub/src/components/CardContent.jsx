import React, { useState, useEffect, useRef } from 'react';
import '../styles/CardTitle.css';
import EditableCodeBlock from './EditableCodeBlock';
import { PatchNode, GetNodeById } from '../services/urls.js';

export default function CardContent({initialName = '', initialCode = '', initCardId = null, lockNode = null, unlockNode = null, updateDescription = null }) {
    const [isCodeBlockVisible, setIsCodeBlockVisible] = useState(false);
    const [name, setName] = React.useState(initialName);
    const [code, setCode] = React.useState(initialCode);
    const [cardId, setCardId] = React.useState(initCardId);

    useEffect(() => {
        setName(initialName);
        setCardId(initCardId);
        setCode(initialCode);
    }, [initialName, initialCode, initCardId]);

    const toggleCodeBlock = async () => {
        setIsCodeBlockVisible(!isCodeBlockVisible);
        if (!isCodeBlockVisible)
        {
            lockNode(initCardId);
            var node = await GetNodeById(cardId);
            let code = node.data.content;
            setCode(code);
        }
        else
            unlockNode(initCardId);
    };

    async function onCodeChange(code) {
        setCode(code);
        await PatchNode(cardId, { content: code });
        await updateDescription(cardId, code);
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

            {isCodeBlockVisible && <EditableCodeBlock initialCode={code} onCodeChange={onCodeChange}/>}
        </>
    );
}