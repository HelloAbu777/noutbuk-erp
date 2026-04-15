import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  address?: string;
  debt: number;
  telegramChatId?: string;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    debt: { type: Number, default: 0 },
    telegramChatId: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for faster queries
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ name: 'text' });
CustomerSchema.index({ debt: -1 });

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>('Customer', CustomerSchema);
