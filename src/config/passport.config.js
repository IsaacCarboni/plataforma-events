import passport from 'passport';
import local from 'passport-local';
import { userService } from '../services/index.js'; 
import { createHash, isValidPassword } from '../utils/hash.js'; 

const LocalStrategy = local.Strategy;

const initializePassport = () => {

    passport.use('register', new LocalStrategy(
        {
            passReqToCallback: true, 
            usernameField: 'email'   
        },
        async (req, username, password, done) => {
            const { first_name, last_name, age } = req.body;

            try {
                const userExists = await userService.getUserByEmail(username);
                
                if (userExists) {
                    return done(null, false, { message: 'El correo electrónico ya está registrado.' });
                }

                const hashedPassword = await createHash(password);

                const newUser = {
                    first_name,
                    last_name,
                    email: username,
                    age,
                    password: hashedPassword,
                    role: 'user' // Garantiza que no se inyecten roles privilegias desde el body
                };

                const result = await userService.createUser(newUser);
                return done(null, result);

            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await userService.getUserByEmail(username);
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado.' });
                }

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