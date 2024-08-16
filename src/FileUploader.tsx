import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { TextField, Button, Checkbox, FormControlLabel, Typography, Container } from '@mui/material';
import { validateAndFixJson, generateUUID } from './utils/fileUtils';

// Функция для сохранения JSON в файл
const saveJsonToFile = (jsonObject: object, filename: string) => {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    saveAs(blob, filename);
};

// Функция для корректной интерпретации значения как строки, числа, булевого значения или null
const parseValue = (value: string) => {
    value = value.trim();

    if (value === 'null') {
        return null;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    if (!isNaN(Number(value))) {
        return Number(value);
    }
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    return value;
};

// Функция для обновления значения в JSON объекте по ключу
const updateJsonValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const lastObj = keys.reduce((o, key) => o[key], obj);

    if (lastKey) {
        lastObj[lastKey] = value;
    }

    return obj;
};

// Функция для создания и сохранения нескольких JSON файлов
const saveMultipleJsonFiles = (jsonObject: object, key: string, values: string[], uuidKeys: string[]) => {
    values.forEach((value, index) => {
        const parsedValue = parseValue(value);
        let updatedJson = updateJsonValue({...jsonObject}, key, parsedValue);

        uuidKeys.forEach(uuidKey => {
            updatedJson = updateJsonValue(updatedJson, uuidKey, generateUUID());
        });

        const filename = `updated_data_${index + 1}.json`;
        saveJsonToFile(updatedJson, filename);
    });
};

const JsonInputSaver: React.FC = () => {
    const [jsonInput, setJsonInput] = useState<string>('');
    const [keyInput, setKeyInput] = useState<string>('');
    const [valuesInput, setValuesInput] = useState<string>('');
    const [uuidKeysInput, setUuidKeysInput] = useState<string>('requestId');
    const [generateUuid, setGenerateUuid] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(event.target.value);
        setErrorMessage(null);
    };

    const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setKeyInput(event.target.value);
    };

    const handleValuesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValuesInput(event.target.value);
    };

    const handleUuidKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUuidKeysInput(event.target.value);
    };

    const handleGenerateUuidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGenerateUuid(event.target.checked);
        if (!event.target.checked) {
            setUuidKeysInput('');
        } else {
            setUuidKeysInput('requestId');
        }
    };

    const handleClick = () => {
        const [isValid, fixedJson] = validateAndFixJson(jsonInput);

        if (isValid) {
            try {
                const jsonObject = JSON.parse(fixedJson as string);
                const values = valuesInput.split(',').map(value => value.trim());
                const uuidKeys = generateUuid ? uuidKeysInput.split(',').map(key => key.trim()) : [];

                if (!keyInput) {
                    setErrorMessage("Введите ключ для замены.");
                    return;
                }

                if (values.length === 0) {
                    setErrorMessage("Введите значения для замены.");
                    return;
                }

                saveMultipleJsonFiles(jsonObject, keyInput, values, uuidKeys);
            } catch {
                setErrorMessage("Не удалось сохранить JSON. Попробуйте другой формат.");
            }
        } else {
            setErrorMessage(fixedJson as string);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                JSON Input Saver
            </Typography>
            <TextField
                value={jsonInput}
                onChange={handleJsonChange}
                placeholder='Введите JSON сюда (например: {"foo":123,"bar":"123"})'
                multiline
                rows={10}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <TextField
                value={keyInput}
                onChange={handleKeyChange}
                placeholder='Введите ключ для замены (например: foo)'
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <TextField
                value={valuesInput}
                onChange={handleValuesChange}
                placeholder='Введите значения через запятую (например: 333, "222", null, true, false)'
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={generateUuid}
                        onChange={handleGenerateUuidChange}
                        color="primary"
                    />
                }
                label="Генерировать UUID"
                style={{ marginTop: 10 }}
            />
            {generateUuid && (
                <TextField
                    value={uuidKeysInput}
                    onChange={handleUuidKeysChange}
                    placeholder='Введите ключи для UUID через запятую (например: requestId, anotherKey)'
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
            )}
            <Button
                onClick={handleClick}
                variant="contained"
                color="primary"
                style={{ marginTop: 20 }}
            >
                Сохранить JSON
            </Button>
            {errorMessage && <Typography color="error" style={{ marginTop: 20 }}>{errorMessage}</Typography>}
        </Container>
    );
};

export default JsonInputSaver;
