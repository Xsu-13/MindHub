import React, { useEffect, useRef } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";

export default function EditableCodeBlock({ initialCode = '', onCodeChange }) {
    const textRef = useRef();
    const [code, setCode] = React.useState(initialCode);

    useEffect(() => {
        setCode(initialCode); // Обновление состояния при изменении начального кода
    }, [initialCode]);

    const handleChange = (evn) => {
        setCode(evn.target.value);
        if (onCodeChange) {
            onCodeChange(evn.target.value); // Вызов функции для обновления кода
        }
    };

    // Focus the editor when the component mounts
    useEffect(() => {
        if (textRef.current) {
            textRef.current.focus();
        }
    }, []);

    return (
        <CodeEditor
            value={code}
            ref={textRef}
            language="py"
            placeholder="Please enter python code."
            onChange={handleChange}
            padding={15}
            style={{
                backgroundColor: "#f9fafb",
                fontFamily:
                    "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
                fontSize: 14,
                marginBottom: 20,
                width: '100%', // Ensure it takes full width
                height: '100%', // Ensure it takes full height
            }}
        />
    );
}
