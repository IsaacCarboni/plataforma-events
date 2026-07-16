import passport from 'passport';
import local from 'passport-local';
import { userService } from '../services/index.js'; 
import { createHash, isValidPassword } from '../utils/hash.js'; 

const LocalStrategy = local.Strategy;

const initializePassport = () => {

    // ========================================================
    // ESTRATEGIA DE REGISTRO ('register') - CENTRALIZADA
    // ========================================================
    passport.use('register', new LocalStrategy(
        {
            passReqToCallback: true, 
            usernameField: 'email'   
        },
        async (req, username, password, done) => {
            const { first_name, last_name, age, role } = req.body;

            try {
                const userExists = await userService.getUserByEmail(username);
                
                if (userExists) {
                    return done(null, false, { message: 'El correo electrónico ya está registrado.' });
                }

                // 🌟 CAMBIO 1: Agregamos 'await' porque 'createHash' es asíncrona.
                // Si no, guardábamos una promesa vacía en vez de la contraseña real.
                const hashedPassword = await createHash(password);

                const newUser = {
                    first_name,
                    last_name,
                    email: username,
                    age,
                    password: hashedPassword, // Ahora sí tiene el texto del hash listo
                    role: role || 'user' 
                };

                const result = await userService.createUser(newUser);
                return done(null, result);

            } catch (error) {
                return done(error);
            }
        }
    ));

    // ========================================================
    // ESTRATEGIA DE LOGIN ('login')
    // ========================================================
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await userService.getUserByEmail(username);
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado.' });
                }

                // 🌟 CAMBIO 2: Agregamos 'await' para esperar la comparación de bcrypt.
                // Además, invertimos el orden de parámetros: pasamos el password plano que
                // ingresó el usuario primero, y el hash de la base de datos segundo.
                const passwordValido = await isValidPassword(password, user.password);
                
                if (!passwordValido) {
                    return done(null, false, { message: 'Contraseña incorrecta.' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // Serialización y deserialización
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userService.getUserById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default initializePassport;