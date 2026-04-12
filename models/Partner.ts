import mongoose, { Schema, Document } from 'mongoose';

export interface IPartner extends Document {
  storeName: string;
  phone: string;
  address?: string;
  note?: string;
  totalGiven: number;
  totalReceived: number;
  createdAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    storeName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    note: { type: String },
    totalGiven: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Partner ||
  mongoose.model<IPartner>('Partner', PartnerSchema);
