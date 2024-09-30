import React, { useState, useEffect } from 'react';
import '../styles/CardTitle.css';
import EditableCodeBlock from './EditableCodeBlock';

export default function CardContent({initialName = ''}) {
    const [isCodeBlockVisible, setIsCodeBlockVisible] = useState(false);
    const [name, setName] = React.useState(initialName);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    const toggleCodeBlock = () => {
        setIsCodeBlockVisible(!isCodeBlockVisible);
    };

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
            
            {isCodeBlockVisible && <EditableCodeBlock />}
        </>
    );
}
