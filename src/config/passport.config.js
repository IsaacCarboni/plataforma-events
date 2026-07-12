import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { isValidPassword } from '../utils/hash.js'; 
import { userDAO } from '../dao/user.dao.js'; 

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {

    // ==========================================
    // 1️⃣ ESTRATEGIA DE LOGIN
    // ==========================================
    passport.use('login', new LocalStrategy(
        { usernameField: 'email', session: false },
        async (email, password, done) => {
            try {
                const user = await userDAO.findByEmail(email);
                
                if (!user) {
                    return done(null, false, { message: 'Credenciales inválidas' });
                }

                const isPasswordValid = await isValidPassword(password, user.password);
                if (!isPasswordValid) {
                    return done(null, false, { message: 'Credenciales inválidas' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // ==========================================
    // 2️⃣ ESTRATEGIA CURRENT
    // ==========================================
    passport.use('current', new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([
                (req) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['currentUser'];
                    }
                    return token;
                }
            ]),
            secretOrKey: process.env.JWT_SECRET
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