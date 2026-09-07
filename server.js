import app from './app.js';
import passport from 'passport';
import initializePassport from './src/config/passport.config.js';

const PORT = process.env.PORT || 8080;

// 1. Inicializas las estrategias de Passport
initializePassport();

// 2. Montas el middleware en la app de Express
app.use(passport.initialize());

// 3. Pones a escuchar al servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando peticiones en el puerto: ${PORT}`);
});