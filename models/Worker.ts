import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
  name: string;
  phone: string;
  position: string;
  salary?: number;
  address?: string;
  hireDate?: Date;
  birthDate?: Date;
  passportInfo?: string;
  notes?: string;
  status: 'active' | 'inactive';
}

const WorkerSchema = new Schema<IWorker>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    position: { type: String, default: 'Sotuvchi' },
    salary: { type: Number },
    address: { type: String },
    hireDate: { type: Date },
    birthDate: { type: Date },
    passportInfo: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

if (mongoose.models.Worker) mongoose.deleteModel('Worker');
export default mongoose.model<IWorker>('Worker', WorkerSchema);
