import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    first_name: { 
      type: String, 
      required: [true, 'El nombre es obligatorio.'],
      trim: true 
    },
    last_name: { 
      type: String, 
      required: [true, 'El apellido es obligatorio.'],
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'El correo electrónico es obligatorio.'], 
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: { 
      type: String, 
      required: [true, 'La contraseña es obligatoria.'] 
    },
    role: { 
      type: String, 
      enum: ['user', 'organizer', 'admin'], 
      default: 'user',
      index: true
    }
  }, 
  { 
    timestamps: true 
  }
);

export const UserModel = model('users', userSchema);