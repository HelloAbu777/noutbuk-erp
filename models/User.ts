import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'kassir' | 'yordamchi';

export interface IUser extends Document {
  name: string;
  login: string;
  password: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'kassir', 'yordamchi'],
      default: 'kassir',
    },
    phone: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
