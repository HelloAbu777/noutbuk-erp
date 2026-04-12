import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  companyName: string;
  contactPerson: string;
  phone: string;
  address?: string;
  totalPurchased: number;
  totalPaid: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    totalPurchased: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Supplier ||
  mongoose.model<ISupplier>('Supplier', SupplierSchema);
