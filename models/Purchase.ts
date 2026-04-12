import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchase extends Document {
  supplier: Types.ObjectId;
  supplierName: string;
  productName: string;
  category: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  totalAmount: number;
  paidAmount: number;
  note?: string;
  createdBy: Types.ObjectId;
  createdByName: string;
  date: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Purchase ||
  mongoose.model<IPurchase>('Purchase', PurchaseSchema);
