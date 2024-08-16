import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { validateAndFixJson, updateJsonValue, generateUUID } from './utils/fileUtils';
import { formatJson } from './utils/formatUtils';
import './styles/styles.css';
import {
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Typography,
    Box,
    Container,
    Modal,
    Snackbar
} from '@mui/material';

const saveJsonToFile = (jsonObject: object, filename: string) => {
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    saveAs(blob, filename);
};

const saveCombinedJsonFile = (jsonObjects: object[], filename: string) => {
    const jsonString = JSON.stringify(jsonObjects, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    saveAs(blob, filename);
};

const saveJsonAsTextFile = (jsonObjects: object[], filename: string) => {
    const jsonStrings = jsonObjects.map(obj => JSON.stringify(obj));
    const textContent = jsonStrings.join('\n');  // Каждый JSON на новой строке
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
};

const parseValue = (value: string) => {
    value = value.trim();
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    return value;
};

const JsonInputSaver: React.FC = () => {
    const [jsonInput, setJsonInput] = useState<string>('');
    const [formattedJson, setFormattedJson] = useState<string>('');
    const [keyInput, setKeyInput] = useState<string>('');
    const [valuesInput, setValuesInput] = useState<string>('');
    const [uuidKeysInput, setUuidKeysInput] = useState<string>('requestId');
    const [generateUuid, setGenerateUuid] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [jsonInputError, setJsonInputError] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [jsonPreview, setJsonPreview] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<string | null>(null);  // Состояние для уведомления
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const clearError = () => {
        setErrorMessage(null);  // Очищаем сообщение об ошибке
    };

    const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = event.target.value;
        setJsonInput(input);

        try {
            JSON.parse(input);
            setFormattedJson(input);
            setJsonInputError(false);
            clearError();  // Очищаем ошибку, если JSON корректный
        } catch {
            setJsonInputError(true);
            setFormattedJson(input);
        }
    };

    const handleFormatJson = () => {
        try {
            const formatted = formatJson(jsonInput);
            setJsonInput(formatted);
            clearError();  // Очищаем ошибку при успешном форматировании
        } catch (error) {
            setErrorMessage('Ошибка форматирования JSON.');
        }
    };

    const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setKeyInput(event.target.value);
        clearError();  // Очищаем ошибку при изменении ключа
    };

    const handleValuesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValuesInput(event.target.value);
        clearError();  // Очищаем ошибку при изменении значения
    };

    const handleUuidKeysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUuidKeysInput(event.target.value);
        clearError();  // Очищаем ошибку при изменении UUID ключа
    };

    const handleGenerateUuidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGenerateUuid(event.target.checked);
        clearError();  // Очищаем ошибку при изменении флага UUID
        if (!event.target.checked) setUuidKeysInput('');
        else setUuidKeysInput('requestId');
    };

    const handleGeneratePreview = () => {
        if (jsonInputError) {
            setErrorMessage("Введённый JSON имеет ошибки.");
            return;
        }

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

                const allJsonObjects: object[] = values.map((value) => {
                    const parsedValue = parseValue(value);
                    let updatedJson = updateJsonValue({ ...jsonObject }, keyInput, parsedValue);
                    uuidKeys.forEach(uuidKey => {
                        updatedJson = updateJsonValue(updatedJson, uuidKey, generateUUID());
                    });
                    return updatedJson;
                });

                const jsonPreview = allJsonObjects.map(obj => JSON.stringify(obj, null, 2)).join('\n\n');
                setJsonPreview(jsonPreview);
                setOpenModal(true);  // Открываем модальное окно
            } catch {
                setErrorMessage("Не удалось сгенерировать JSON. Попробуйте другой формат.");
            }
        } else {
            setErrorMessage(fixedJson as string);
        }
    };

    const handleSaveMultiple = () => {
        if (jsonInputError) {
            setErrorMessage("Введённый JSON имеет ошибки.");
            return;
        }

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

                values.forEach((value, index) => {
                    const parsedValue = parseValue(value);
                    let updatedJson = updateJsonValue({ ...jsonObject }, keyInput, parsedValue);
                    uuidKeys.forEach(uuidKey => {
                        updatedJson = updateJsonValue(updatedJson, uuidKey, generateUUID());
                    });
                    saveJsonToFile(updatedJson, `data_${index + 1}.json`);
                });
            } catch {
                setErrorMessage("Не удалось сохранить JSON. Попробуйте другой формат.");
            }
        } else {
            setErrorMessage(fixedJson as string);
        }
    };

    const handleSaveCombined = () => {
        if (jsonInputError) {
            setErrorMessage("Введённый JSON имеет ошибки.");
            return;
        }

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

                const allJsonObjects: object[] = values.map((value) => {
                    const parsedValue = parseValue(value);
                    let updatedJson = updateJsonValue({ ...jsonObject }, keyInput, parsedValue);
                    uuidKeys.forEach(uuidKey => {
                        updatedJson = updateJsonValue(updatedJson, uuidKey, generateUUID());
                    });
                    return updatedJson;
                });

                saveCombinedJsonFile(allJsonObjects, 'combined_data.json');
            } catch {
                setErrorMessage("Не удалось сохранить JSON. Попробуйте другой формат.");
            }
        } else {
            setErrorMessage(fixedJson as string);
        }
    };

    const handleSaveAsTextFile = () => {
        if (jsonInputError) {
            setErrorMessage("Введённый JSON имеет ошибки.");
            return;
        }

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

                const allJsonObjects: object[] = values.map((value) => {
                    const parsedValue = parseValue(value);
                    let updatedJson = updateJsonValue({ ...jsonObject }, keyInput, parsedValue);
                    uuidKeys.forEach(uuidKey => {
                        updatedJson = updateJsonValue(updatedJson, uuidKey, generateUUID());
                    });
                    return updatedJson;
                });

                saveJsonAsTextFile(allJsonObjects, 'data.txt');
            } catch {
                setErrorMessage("Не удалось сохранить JSON. Попробуйте другой формат.");
            }
        } else {
            setErrorMessage(fixedJson as string);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(jsonPreview).then(() => {
            setSnackbarOpen(true);  // Показать snackbar с уведомлением
        }).catch(() => {
            setErrorMessage("Не удалось скопировать JSON.");
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };


    return (
        <Container>
            <Box className="header-container">
                <Typography variant="h4" component="h1" className="header-text">
                    JSON Генератор
                </Typography>
            </Box>
            <TextField
                value={jsonInput}
                onChange={handleJsonChange}
                placeholder="Введите JSON здесь"
                variant="outlined"
                fullWidth
                multiline
                rows={10}
                error={jsonInputError}
                helperText={jsonInputError ? "Неверный формат JSON" : ""}
                className="text-field"
            />
            <Box className="format-container">
                <Button
                    onClick={handleFormatJson}
                    variant="contained"
                    color="primary"
                    className="format-button"
                >
                    Форматировать JSON
                </Button>
            </Box>
            <TextField
                value={keyInput}
                onChange={handleKeyChange}
                placeholder="Введите ключ для замены (например: foo)"
                variant="outlined"
                fullWidth
                margin="normal"
                className="input-container"
            />
            <TextField
                value={valuesInput}
                onChange={handleValuesChange}
                placeholder='Введите значения для замены через запятую (например: 333,"222")'
                variant="outlined"
                fullWidth
                margin="normal"
                className="input-container"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={generateUuid}
                        onChange={handleGenerateUuidChange}
                    />
                }
                label="Сгенерировать UUID для ключа"
            />
            {generateUuid && (
                <TextField
                    value={uuidKeysInput}
                    onChange={handleUuidKeysChange}
                    placeholder="Введите ключи для UUID (например: requestId)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    className="input-container"
                />
            )}
            <Box className="button-container">
                <Button
                    onClick={handleSaveMultiple}
                    variant="contained"
                    color="primary"
                    className="save-button"
                >
                    Сохранить JSON по отдельности
                </Button>
                <Button
                    onClick={handleSaveCombined}
                    variant="contained"
                    color="secondary"
                    className="save-button"
                >
                    Сохранить все JSON одним файлом
                </Button>
                <Button
                    onClick={handleSaveAsTextFile}
                    variant="contained"
                    className="save-button"
                >
                    Сохранить JSON как текстовый файл
                </Button>
                <Button
                    onClick={handleGeneratePreview}
                    variant="contained"
                    className="preview-button"
                >
                    Показать JSON
                </Button>
            </Box>
            {errorMessage && (
                <Typography variant="body1" color="error" className="error-message">
                    {errorMessage}
                </Typography>
            )}
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box className="modal-content">
                    <Box className="copy-button-container">
                        <Button
                            onClick={handleCopyToClipboard}
                            variant="contained"
                            color="primary"
                        >
                            Копировать
                        </Button>
                    </Box>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Сгенерированные JSON объекты
                    </Typography>
                    <Box
                        id="modal-description"
                        className="json-preview"
                    >
                        {jsonPreview}
                    </Box>
                </Box>
            </Modal>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="JSON скопирован в буфер обмена."
                action={
                    <Button color="inherit" onClick={handleCloseSnackbar}>
                        Закрыть
                    </Button>
                }
                sx={{ backgroundColor: '#4caf50' }}  // Зеленый цвет для успешного уведомления
            />
        </Container>
    );
};


export default JsonInputSaver;
