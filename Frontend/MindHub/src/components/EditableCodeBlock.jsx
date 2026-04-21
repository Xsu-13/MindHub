import React, { useEffect, useRef } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";

export default function EditableCodeBlock({ initialCode = '', language = 'py', fontSize = 14, onCodeChange }) {
    const textRef = useRef();
    const [code, setCode] = React.useState(initialCode);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    const handleChange = (evn) => {
        setCode(evn.target.value);
        if (onCodeChange) {
            onCodeChange(evn.target.value);
        }
        autoResize(evn.target);
    };

    const autoResize = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    useEffect(() => {
        if (textRef.current) {
            textRef.current.focus();
            autoResize(textRef.current);
        }
    }, []);

    return (
        <CodeEditor
            className="node-code-editor"
            value={code}
            ref={textRef}
            language={language}
            placeholder={`Введите код (${language})`}
            onChange={handleChange}
            padding={15}
            style={{
                backgroundColor: "#ffffff",
                color: "#0f172a",
                fontSize: `${fontSize}px`,
                marginBottom: 12,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                resize: 'none',
                overflow: 'hidden',
                minHeight: '100px',
                fontFamily: 'inherit',
                fontWeight: 500
            }}
        />
    );
}
