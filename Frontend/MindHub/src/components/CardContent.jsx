import React, { useState, useEffect } from 'react';
import '../styles/CardTitle.css';
import EditableCodeBlock from './EditableCodeBlock';
import { PatchNode } from '../services/urls.js';

export default function CardContent({initialName = '', initialCode = '', initCardId = null}) {
    const [isCodeBlockVisible, setIsCodeBlockVisible] = useState(false);
    const [name, setName] = React.useState(initialName);
    const [code, setCode] = React.useState(initialCode);
    const [cardId, setCardId] = React.useState(initCardId);

    useEffect(() => {
        setName(initialName);
        setCardId(initCardId);
        setCode(initialCode);
    }, [initialName, initialCode, initCardId]);

    const toggleCodeBlock = () => {
        setIsCodeBlockVisible(!isCodeBlockVisible);
    };

    async function onCodeChange(code)
    {
        setCode(code);
        await PatchNode(cardId, {content: code});
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