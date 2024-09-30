import React, { useState } from 'react';
import '../styles/CardTitle.css';
import EditableCodeBlock from './EditableCodeBlock';

function CardContent() {
    const [isCodeBlockVisible, setIsCodeBlockVisible] = useState(false); // Состояние для видимости

    const toggleCodeBlock = () => {
        setIsCodeBlockVisible(!isCodeBlockVisible); // Переключаем видимость
    };

    return (
        <>
            <div className='card_title'>
                <div className='card_name'>
                    Hello
                </div>
                <div className='button_content'>
                    <button className="burger_menu" onClick={toggleCodeBlock}>
                        &#9776;
                    </button>
                </div>
            </div>
            
            {isCodeBlockVisible && <EditableCodeBlock />} {/* Отображаем компонент при true */}
        </>
    );
}

export default CardContent;
