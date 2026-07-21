import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { userService } from '../services/index.js'; 
import { createHash, isValidPassword } from '../utils/hash.js'; 

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

// Función aux para extraer el JWT directamente desde la cookie HTTP-Only
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['currentUser']; // Nombre de la cookie donde guardamos el JWT
    }
    return token;
};

const initializePassport = () => {

    // 1. Estrategia de Registro Local
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
                    role: 'user' // Garantiza que no se inyecten roles privilegiados desde el body
                };

                const result = await userService.createUser(newUser);
                return done(null, result);

            } catch (error) {
                return done(error);
            }
        }
    ));

    // 2. Estrategia de Login Local
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

    // 3. Estrategia JWT ('current') 👈 ¡ACÁ ESTABA LO QUE FALTABA!
    passport.use('current', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: process.env.JWT_SECRET || 'secretCoder'
        },
        async (jwt_payload, done) => {
            try {
                // El payload del JWT contiene los datos del usuario extraídos de la cookie
                return done(null, jwt_payload);
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