// Функция для проверки и исправления JSON
export const validateAndFixJson = (jsonString: string): [boolean, string | null] => {
    try {
        // Попробуем распарсить JSON
        JSON.parse(jsonString);
        return [true, jsonString];
    } catch {
        return [false, "Неверный формат JSON. Убедитесь, что JSON корректно отформатирован."];
    }
};

// Функция для обновления значения по ключу в объекте
export const updateJsonValue = (jsonObject: any, key: string, newValue: any): any => {
    const keys = key.split('.');
    let updatedObject = { ...jsonObject };

    // Рекурсивная функция для обновления значения по ключу
    const updateValue = (obj: any, keys: string[], value: any) => {
        if (keys.length === 1) {
            obj[keys[0]] = value;
        } else {
            const currentKey = keys.shift()!;
            if (obj[currentKey] && typeof obj[currentKey] === 'object') {
                updateValue(obj[currentKey], keys, value);
            }
        }
    };

    updateValue(updatedObject, keys, newValue);
    return updatedObject;
};

// Генерация UUID
export const generateUUID = (): string => {
    // Простой метод генерации UUID
    return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11)
        .replace(/[018]/g, (c: any) =>
            (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)).toString(16)
        );
};
