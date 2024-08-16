// src/utils/formatUtils.ts

/**
 * Форматирует строку JSON в читаемый формат.
 * @param jsonString Строка JSON.
 * @returns Отформатированная строка JSON.
 */
// src/utils/formatUtils.ts
export const formatJson = (jsonString: string): string => {
    try {
        const jsonObject = JSON.parse(jsonString);
        return JSON.stringify(jsonObject, null, 2);
    } catch (error) {
        throw new Error('Неверный формат JSON');
    }
};
