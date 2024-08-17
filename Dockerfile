# Используем официальный Node.js образ
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json ./
RUN npm install

# Копируем все файлы проекта в контейнер
COPY . .

# Собираем проект
RUN npm run build

# Устанавливаем переменную окружения для порта
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["npx", "serve", "-s", "build"]
