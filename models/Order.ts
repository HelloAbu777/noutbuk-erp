import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  quantity: number;
  sellPrice: number;
}

export interface IOrder extends Document {
  yordamchi: Types.ObjectId;
  yordamchiName: string;
  customer?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'rejected';
  acceptedBy?: Types.ObjectId;
  acceptedByName?: string;
  rejectedReason?: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    yordamchi: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    yordamchiName: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    customerPhone: { type: String },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedByName: { type: String },
    rejectedReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);
