import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISaleItem {
  product: Types.ObjectId;
  productName: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
}

export interface ISale extends Document {
  items: ISaleItem[];
  total: number;
  totalCost: number;
  paymentType: 'naqt' | 'karta' | 'nasiya' | 'aralash';
  naqtAmount?: number;
  kartaAmount?: number;
  customer?: Types.ObjectId;
  customerName?: string;
  createdBy: Types.ObjectId;
  createdByName: string;
  date: Date;
  status: 'active' | 'returned';
  returnedAt?: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
});

const SaleSchema = new Schema<ISale>(
  {
    items: [SaleItemSchema],
    total: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: ['naqt', 'karta', 'nasiya', 'aralash'],
      required: true,
    },
    naqtAmount: { type: Number },
    kartaAmount: { type: Number },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'returned'], default: 'active' },
    returnedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
