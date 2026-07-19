import app from './app.js';
import passport from 'passport';
import initializePassport from './src/config/passport.config.js';

const PORT = process.env.PORT || 8080;

// Inicialización del motor de autenticación
initializePassport();
app.use(passport.initialize());

app.listen(PORT, () => {
    console.log(`Servidor escuchando peticiones en el puerto: ${PORT}`);
});