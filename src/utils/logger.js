import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Definición de niveles y colores personalizados requeridos
const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'magenta',
        warning: 'yellow',
        info: 'green',
        http: 'blue',
        debug: 'white'
    }
};

winston.addColors(customLevelsOptions.colors);

// Determinamos el entorno actual (por defecto 'development')
const currentEnv = process.env.NODE_ENV || 'development';

// Configuración de transportes según el entorno
const transports = [
    // Consola: Muestra debug en dev, e info en adelante en producción
    new winston.transports.Console({
        level: currentEnv === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
            winston.format.colorize({ colors: customLevelsOptions.colors }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
        )
    })
];

// En producción o desarrollo, guardamos los errores (nivel error y fatal) en archivos rotativos
const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error', // Solo captura 'error' y 'fatal' (porque tienen un peso menor o igual en el ranking de niveles)
    maxFiles: '14d', // Mantiene los logs de los últimos 14 días
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    )
});

transports.push(fileRotateTransport);

// Creación del logger centralizado
const logger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports
});

export default logger;