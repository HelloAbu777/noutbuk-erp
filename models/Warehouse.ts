import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  category: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  barcode?: string;
  description?: string;
  purchaseId?: Types.ObjectId;
  supplierName?: string;
  status: 'in_warehouse' | 'sent_to_shop';
  sentAt?: Date;
  createdAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    barcode: { type: String },
    description: { type: String },
    purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase' },
    supplierName: { type: String },
    status: { type: String, enum: ['in_warehouse', 'sent_to_shop'], default: 'in_warehouse' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Warehouse ||
  mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
