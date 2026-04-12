import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  shopName: string;
  address: string;
  phone: string;
  checkText: string;
  categories: string[];
  telegramBotToken: string;
  telegramChatId: string;
  telegramNotifications: {
    nasiya: boolean;
    sotuv: boolean;
    xarid: boolean;
  };
  // GramJS — shaxsiy akkaunt orqali yuborish
  gramApiId: string;
  gramApiHash: string;
  gramPhone: string;
  gramSession: string; // saqlangan sessiya
}

const SettingsSchema = new Schema<ISettings>(
  {
    shopName: { type: String, default: "Noutbuk Do'kon" },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    checkText: { type: String, default: 'Xaridingiz uchun rahmat!' },
    categories: { type: [String], default: ['Noutbuk', 'Aksessuar', 'Telefon', 'Boshqa'] },
    telegramBotToken: { type: String, default: '' },
    telegramChatId: { type: String, default: '' },
    telegramNotifications: {
      nasiya: { type: Boolean, default: true },
      sotuv: { type: Boolean, default: true },
      xarid: { type: Boolean, default: true },
    },
    gramApiId: { type: String, default: '' },
    gramApiHash: { type: String, default: '' },
    gramPhone: { type: String, default: '' },
    gramSession: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Settings ||
  mongoose.model<ISettings>('Settings', SettingsSchema);
