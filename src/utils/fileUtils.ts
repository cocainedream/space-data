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
export const updateJsonValue = (obj: Record<string, any>, path: string, value: any): Record<string, any> => {
    // Выполняем глубокое клонирование объекта внутри функции
    const clonedObj = JSON.parse(JSON.stringify(obj));

    const keys = path.split('.');
    let current = clonedObj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    return clonedObj;
};

// Генерация UUID
export const generateUUID = (): string => {
    // Простой метод генерации UUID
    return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11)
        .replace(/[018]/g, (c: any) =>
            (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)).toString(16)
        );
};
