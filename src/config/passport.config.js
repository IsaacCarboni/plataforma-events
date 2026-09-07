import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { userService } from '../services/user.service.js';
import { createHash, isValidPassword } from '../utils/hash.js'; 

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

// Extractor para leer el JWT desde la cookie HTTP-Only
const cookieExtractor = (req) => {
    return req && req.cookies ? req.cookies['currentUser'] : null;
};

const initializePassport = () => {

    // 1. Registro Local (Público con protección de roles)
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
                    role: 'user' // Seguridad: asignación estricta de rol
                };

                const result = await userService.createUser(newUser);
                return done(null, result);

            } catch (error) {
                return done(error);
            }
        }
    ));

    // 2. Login Local
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

    // 3. Estrategia JWT ('current')
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("⚠️  JWT_SECRET no está definida en las variables de entorno.");
    }

    passport.use('current', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: jwtSecret
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload);
            } catch (error) {
                return done(error);
            }
        }
    ));
};

export default initializePassport;