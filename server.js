import app from './app.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import initializePassport from './src/config/passport.config.js'; // Acordate del .js al final

const PORT = process.env.PORT || 8080;

// Middlewares obligatorios antes de las rutas
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

// Levantar el servidor de manera independiente
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});