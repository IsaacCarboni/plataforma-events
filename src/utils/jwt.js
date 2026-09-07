import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET no está definida en las variables de entorno.');
  }

  // Normalizamos el ID para aceptar tanto objeto ObjectId de Mongoose como id normal
  const userId = user._id ? user._id.toString() : user.id;

  return jwt.sign(
    { 
      id: userId, 
      email: user.email, 
      role: user.role 
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};