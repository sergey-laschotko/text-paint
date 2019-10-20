import React, { useState, useEffect } from 'react';
import './CanvasGenerator.css';

const CanvasGenerator = () => {
    const fileInput = React.createRef();
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [textImage, setTextImage] = useState(null);
    const canvasExp = /c\s?\d{1,}\s\d{1,}/i;
    const lineExp = /l\s?\d{1,}\s\d{1,}\s\d{1,}\s\d{1,}/i;
    const rectExp = /r\s?\d{1,}\s\d{1,}\s\d{1,}\s\d{1,}/i;
    const bucketExp = /b\s?\d{1,}\s\d{1,}\s\S/i;
    const dotSymbol = 'x';
    const canvasVBorderSymbol = '-';
    const canvasHBorderSymbol = '|';

    useEffect(() => {
        if (fileContent) {
            createTextImage(fileContent);
        }
    }, [fileContent]);
    
    const chooseFile = () => {
        fileInput.current.click();
    };

    const createCanvas = (width, height) => {
        const canvasArr = [];

        for (let i = 0; i < height; i++) {
            const canvasLine = [];
            for (let j = 0; j < width; j++) {
                canvasLine.push(' ');
            }
            canvasArr.push(canvasLine);
        }

        return canvasArr;
    };

    const addCanvasBorders = (canvas, vBorderSymbol, hBorderSymbol) => {
        if (!canvas.length) {
            return canvas;
        }
        const vBorder = [];

        for (let j = 0; j < canvas.length; j++) {
            canvas[j].unshift(hBorderSymbol);
            canvas[j].push(hBorderSymbol);
        }

        for (let i = 0; i < canvas[0].length; i++) {
            vBorder.push(vBorderSymbol);
        }

        canvas.unshift(vBorder);
        canvas.push(vBorder);
        return canvas;
    };

    const addLine = (canvas, x1, y1, x2, y2, symbol) => {
        --x1;
        --y1;
        --x2;
        --y2;
        if (x1 < 0) x1 = 0;
        if (x1 > canvas[0].length) x1 = canvas[0].length;
        if (y1 < 0) y1 = 0;
        if (y1 > canvas.length) y1 = canvas.length;
        if (x2 < 0) x2 = 0;
        if (x2 > canvas[0].length) x2 = canvas[0].length;
        if (y2 < 0) y2 = 0;
        if (y2 > canvas.length) y2 = canvas.length;
        if (x1 === x2) {
            for (let i = y1, j = y2; i !== j; ) {
                canvas[i][x1] = symbol;
                canvas[j][x1] = symbol;
                i < j ? i++ : j++;
            }
        } else if (y1 === y2) {
            for (let i = x1, j = x2; i !== j; ) {
                canvas[y1][i] = symbol;
                canvas[y1][j] = symbol;
                i < j ? i++ : j++;
            }
        } else {
            canvas[y1][x1] = symbol;
        }
    };

    const addRect = (canvas, x1, y1, x2, y2, symbol) => {
        --x1;
        --y1;
        --x2;
        --y2;
        if (x1 < 0) x1 = 0;
        if (x1 > canvas[0].length) x1 = canvas[0].length;
        if (y1 < 0) y1 = 0;
        if (y1 > canvas.length) y1 = canvas.length;
        if (x2 < 0) x2 = 0;
        if (x2 > canvas[0].length) x2 = canvas[0].length;
        if (y2 < 0) y2 = 0;
        if (y2 > canvas.length) y2 = canvas.length;
        for (let i = x1, j = x2; i !== j; ) {
            canvas[y1][i] = symbol;
            canvas[y1][j] = symbol;
            canvas[y2][i] = symbol;
            canvas[y2][j] = symbol;
            i < j ? i++ : j++;
        }

        for (let i = y1, j = y2; i !== j; ) {
            canvas[i][x1] = symbol;
            canvas[i][x2] = symbol;
            canvas[j][x1] = symbol;
            canvas[j][x2] = symbol;
            i < j ? i++ : j++;
        }
    };

    const addBucketFill = (canvas, x, y, symbol) => {
        let target = ' ';
        if (canvas[y] && canvas[y][x]) {
            target = canvas[y][x];
        }
        canvas[y][x] = symbol;
        if (canvas[y - 1] && canvas[y - 1][x] === target) {
            addBucketFill(canvas, x, y - 1, symbol);
        }
        if (canvas[y + 1] && canvas[y + 1][x] === target) {
            addBucketFill(canvas, x, y + 1, symbol);
        }
        if (canvas[y][x - 1] && canvas[y][x - 1] === target) {
            addBucketFill(canvas, x - 1, y, symbol);
        }
        if (canvas[y][x + 1] && canvas[y][x + 1] === target) {
            addBucketFill(canvas, x + 1, y, symbol);
        }
    };

    const createTextImage = (fileContent) => {
        const canvasEl = fileContent.match(canvasExp);
        if (!canvasEl) {
            return setError('Холст не найден (элемент \'C\'). Исправьте файл.');
        }
        const canvasSizes = canvasEl[0].slice(canvasEl[0].search(/\d/)).split(' ');
        if (Number(canvasSizes[0]) === 0 || Number(canvasSizes[1]) === 0) {
            return setError('Ни ширина, ни высота холста (\'C\') не может быть равной 0. Исправьте файл.');
        }
        let text = fileContent
            .slice(canvasEl[0].length)
            .toLowerCase()
            .split(/\r?\n/)
            .join(' ');
        let canvas = createCanvas(Number(canvasSizes[0]), Number(canvasSizes[1]));
        for (let i = 0; i < text.length; i++) {
            if (text[0] === ' ') {
                text = text.slice(1);
                i = 0;
                continue;
            }
            const line = text.match(lineExp);
            const rect = text.match(rectExp);
            const bucket = text.match(bucketExp);
            if (line && line.index === 0) {
                let [x1, y1, x2, y2] = line[0].slice(line[0].search(/\d/)).split(' ');
                text = text.slice(line[0].length);
                i = 0;
                addLine(canvas, Number(x1), Number(y1), Number(x2), Number(y2), dotSymbol);
            } else if (rect && rect.index === 0) {
                let [x1, y1, x2, y2] = rect[0].slice(rect[0].search(/\d/)).split(' ');
                text = text.slice(rect[0].length);
                i = 0;
                addRect(canvas, Number(x1), Number(y1), Number(x2), Number(y2), dotSymbol);
            } else if (bucket && bucket.index === 0) {
                let [x1, y1, fill] = bucket[0].slice(bucket[0].search(/\d/)).split(' ');
                text = text.slice(bucket[0].length);
                i = 0;
                addBucketFill(canvas, Number(x1), Number(y1), fill);
            } else {
                setError(`Найден неизвестный символ. Проверьте файл.`);
                return;
            }
        }
        canvas = addCanvasBorders(canvas, canvasVBorderSymbol, canvasHBorderSymbol);
        let result = [];
        for (let line of canvas) {
            result.push(line.join(''));
        }
        setTextImage(result.join('\r\n'));
    };

    const onFileInputChange = (e) => {
        const file = fileInput.current.files[0];
        setFileName(fileInput.current.files[0].name);
        if (file.name.slice(-4) !== '.txt') {
            setError('Поддерживаются только .txt файлы');
        } else {
            setError('');
        }
    };

    const onCreateTextImage = () => {
        const fileReader = new FileReader();
        fileReader.onerror = () => setError('Ошибка чтения файла');
        fileReader.onload = function() {
            setFileContent(fileReader.result);
        }
        fileReader.readAsText(fileInput.current.files[0], 'utf8');
    };

    const downloadTextImage = () => {
        const file = new Blob([textImage], { type: 'text/plain' });
        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, 'text_image.txt');
        else {
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = 'text_image.txt';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    };

    return (
        <div className="canvas-generator">
            <input hidden type="file" name="file" ref={fileInput} onChange={onFileInputChange} />
            <div className="actions">
                <button className="cg-action blue" onClick={chooseFile}>{ fileName ? 'Выбрать другой файл' : 'Выберите файл' }</button>
                { fileName && !error ? <button className="cg-action green" onClick={onCreateTextImage}>Создать рисунок</button> : null }
                { textImage && !error ? <button className="cg-action blue" onClick={downloadTextImage}>Скачать рисунок</button> : null }
            </div>
            {fileName ? <div className="filename">Файл: {fileName}</div> : null}
            {error ? <div className="error">{error}</div> : null}
            <div className="previews">
                { fileContent ? <div className="preview"><pre>{fileContent}</pre></div> : null }
                { textImage ? <div className="preview"><pre>{textImage}</pre></div> : null }
            </div>
        </div>
    );
};

export default CanvasGenerator;