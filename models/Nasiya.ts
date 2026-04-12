import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPaymentRecord {
  amount: number;
  date: Date;
  note?: string;
}

export interface INasiya extends Document {
  customer: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  sale: Types.ObjectId;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: Date;
  status: 'open' | 'paid' | 'overdue';
  payments: IPaymentRecord[];
  createdBy: Types.ObjectId;
  createdByName: string;
  date: Date;
}

const PaymentRecordSchema = new Schema<IPaymentRecord>({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String },
});

const NasiyaSchema = new Schema<INasiya>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    sale: { type: Schema.Types.ObjectId, ref: 'Sale' },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    dueDate: { type: Date },
    status: { type: String, enum: ['open', 'paid', 'overdue'], default: 'open' },
    payments: [PaymentRecordSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Nasiya ||
  mongoose.model<INasiya>('Nasiya', NasiyaSchema);
