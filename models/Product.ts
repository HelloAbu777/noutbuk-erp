import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  barcode?: string;
  description?: string;
  image?: string;
  status: 'active' | 'archived';
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    barcode: { type: String },
    description: { type: String },
    image: { type: String },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);
