# Imagen base liviana de Node.js
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el código fuente del proyecto
COPY . .

# Exponemos el puerto de Express
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["npm", "run", "dev"]