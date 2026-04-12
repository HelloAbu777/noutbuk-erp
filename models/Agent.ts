import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  phone: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Agent ||
  mongoose.model<IAgent>('Agent', AgentSchema);
