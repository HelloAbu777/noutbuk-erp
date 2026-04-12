import mongoose, { Schema, Document, Types } from 'mongoose';

export type MessageType = 'qarz_eslatma' | 'sotuv_tasdiq' | 'qarz_tolandi';
export type MessageStatus = 'yuborildi' | 'xato' | 'navbatda';

export interface IMessage extends Document {
  customerName: string;
  customerPhone: string;
  type: MessageType;
  messageText: string;
  status: MessageStatus;
  errorText?: string;
  createdBy?: Types.ObjectId;
  createdByName?: string;
  date: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    type: { type: String, enum: ['qarz_eslatma', 'sotuv_tasdiq', 'qarz_tolandi'], required: true },
    messageText: { type: String, required: true },
    status: { type: String, enum: ['yuborildi', 'xato', 'navbatda'], default: 'navbatda' },
    errorText: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>('Message', MessageSchema);
