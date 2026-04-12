import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  category: string;
  amount: number;
  note?: string;
  date: Date;
  createdBy: string;
  createdByName?: string;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    date: { type: Date, default: Date.now },
    createdBy: { type: String },
    createdByName: { type: String },
  },
  { timestamps: true }
);

// Dev mode: clear cached model so schema changes take effect without server restart
if (mongoose.models.Expense) {
  mongoose.deleteModel('Expense');
}

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
