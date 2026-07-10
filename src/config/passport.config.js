import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { UserModel } from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/hash.js'; 

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

// Extractor personalizado para leer la cookie que creamos en el login
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['currentUser']; 
    }
    return token;
};

const initializePassport = () => {

    // 1️⃣ ESTRATEGIA: REGISTRO
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const { first_name, last_name } = req.body;
            try {
                let user = await UserModel.findOne({ email: username });
                if (user) {
                    return done(null, false, { message: 'El email ya está registrado' });
                }

                const newUser = {
                    first_name,
                    last_name,
                    email: username,
                    password: createHash(password),
                    role: 'user' // Rol por defecto requerido
                };

                let result = await UserModel.create(newUser);
                return done(null, result);
            } catch (error) {
                return done('Error en registro: ' + error);
            }
        }
    ));

    // 2️⃣ ESTRATEGIA: LOGIN
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await UserModel.findOne({ email: username });
                if (!user) {
                    return done(null, false, { message: 'Credenciales inválidas' });
                }

                // Validamos la contraseña encriptada con tu función de bcrypt
                if (!isValidPassword(user, password)) {
                    return done(null, false, { message: 'Credenciales inválidas' });
                }

                return done(null, user);
            } catch (error) {
                return done('Error en login: ' + error);
            }
        }
    ));

    // 3️⃣ ESTRATEGIA: CURRENT (JWT via Cookies)
    passport.use('current', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: process.env.JWT_SECRET || 'TuPalabraSecretaHardcodeadaPorSiAcaso'
        },
        async (jwt_payload, done) => {
            try {
                // El payload ya tiene los datos del usuario decodificados
                return done(null, jwt_payload);
            } catch (error) {
                return done(error);
            }
        }
    ));
};

export default initializePassport;