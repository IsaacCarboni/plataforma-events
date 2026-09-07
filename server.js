import express from 'express';
import passport from 'passport';
import initializePassport from './src/config/passport.config.js';
import app from './app.js';

const PORT = process.env.PORT || 8080;

// Inicializamos Passport
initializePassport();
app.use(passport.initialize());

// Levantamos el servidor en 0.0.0.0 para que Docker exponga el puerto
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando peticiones en el puerto: ${PORT}`);
});