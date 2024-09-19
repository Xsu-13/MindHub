// import React, { useState, useEffect, useRef } from 'react';
// import 'prismjs/themes/prism-okaidia.css';
// import Prism from 'prismjs';

// const EditableCodeBlock = () => {
//     const [code, setCode] = useState(`const hello = 'Hello, world!';`);
//     const codeRef = useRef(null);

//     const handleInputChange = (event) => {
//         setCode(event.target.innerText);
//     };

//     useEffect(() => {
//         const selection = window.getSelection();
//         const range = document.createRange();
//         range.selectNodeContents(codeRef.current);
//         selection.removeAllRanges();
//         selection.addRange(range);
        
//         // Обновляем подсветку
//         Prism.highlightAll();

//         // Восстанавливаем курсор
//         selection.removeAllRanges();
//         selection.addRange(range);
//     }, [code]);

//     return (
//         <div>
//             <pre>
//                 <code
//                     contentEditable
//                     suppressContentEditableWarning={true}
//                     onInput={handleInputChange}
//                     ref={codeRef}
//                     className="language-js"
//                     style={{
//                         border: '1px solid #ccc',
//                         padding: '10px',
//                         minHeight: '100px',
//                         backgroundColor: '#f9f9f9',
//                         whiteSpace: 'pre',
//                         overflowWrap: 'break-word',
//                     }}
//                 >
//                     {code}
//                 </code>
//             </pre>
//         </div>
//     );
// };

// export default EditableCodeBlock;

import React, { useState } from "react";
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function EditableCodeBlock() {
    const textRef = React.useRef();
    const [code, setCode] = React.useState(
      `import banana
  
      class Monkey:
          # Bananas the monkey can eat.
          capacity = 10
          def eat(self, n):
              """Make the monkey eat n bananas!"""
              self.capacity -= n * banana.size
      
          def feeding_frenzy(self):
              self.eat(9.25)
              return "Yum yum"`
    );
    console.log(code);
    return (
      <>
        <CodeEditor
          value={code}
          ref={textRef}
          language="py"
          placeholder="Please enter python code."
          onChange={(evn) => setCode(evn.target.value)}
          padding={15}
          style={{
            backgroundColor: "#f9fafb",
            fontFamily:
              "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
            fontSize: 14,
            marginBottom: 20
          }}
        />
        <CodeEditor
          value={code}
          // ref={textRef}
          language="py"
          padding={15}
          style={{
            backgroundColor: "#f9fafb",
            fontFamily:
              "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
            fontSize: 14
          }}
          readOnly
        />
      </>
    );
}
