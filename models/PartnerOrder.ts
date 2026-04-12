import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPartnerOrder extends Document {
  partner: Types.ObjectId;
  partnerName: string;
  productType: string;
  quantity: number;
  price: number;
  note?: string;
  date: Date;
  createdBy: Types.ObjectId;
  createdByName: string;
}

const PartnerOrderSchema = new Schema<IPartnerOrder>(
  {
    partner: { type: Schema.Types.ObjectId, ref: 'Partner', required: true },
    partnerName: { type: String, required: true },
    productType: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    note: { type: String },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PartnerOrder ||
  mongoose.model<IPartnerOrder>('PartnerOrder', PartnerOrderSchema);
