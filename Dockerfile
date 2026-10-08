# Imagen base liviana de Node.js
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos únicamente dependencias de producción (omitimos devDependencies)
RUN npm ci --only=production

# Copiamos todo el código fuente del proyecto
COPY . .

# Exponemos el puerto de Express
EXPOSE 8080

# Comando directo para ejecutar la app en producción
CMD ["node", "server.js"]