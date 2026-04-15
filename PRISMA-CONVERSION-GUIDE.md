# Mongoose dan Prisma ga O'tish Qo'llanmasi

## 📚 Asosiy farqlar:

### 1. Import

**Mongoose:**
```typescript
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';

await connectDB();
```

**Prisma:**
```typescript
import prisma from '@/lib/prisma';
// connectDB kerak emas, Prisma avtomatik ulanadi
```

---

### 2. FIND operatsiyalari

#### Find All
**Mongoose:**
```typescript
const products = await Product.find({ status: 'active' })
  .sort({ name: 1 })
  .lean();
```

**Prisma:**
```typescript
const products = await prisma.product.findMany({
  where: { status: 'active' },
  orderBy: { name: 'asc' },
});
```

#### Find One by ID
**Mongoose:**
```typescript
const product = await Product.findById(id).lean();
```

**Prisma:**
```typescript
const product = await prisma.product.findUnique({
  where: { id },
});
```

#### Find One with condition
**Mongoose:**
```typescript
const product = await Product.findOne({ barcode: '000001' }).lean();
```

**Prisma:**
```typescript
const product = await prisma.product.findFirst({
  where: { barcode: '000001' },
});
```

---

### 3. CREATE operatsiyalari

**Mongoose:**
```typescript
const product = await Product.create({
  name: 'Laptop',
  price: 1000,
});
```

**Prisma:**
```typescript
const product = await prisma.product.create({
  data: {
    name: 'Laptop',
    price: 1000,
  },
});
```

---

### 4. UPDATE operatsiyalari

**Mongoose:**
```typescript
const product = await Product.findByIdAndUpdate(
  id,
  { quantity: 10 },
  { new: true }
);
```

**Prisma:**
```typescript
const product = await prisma.product.update({
  where: { id },
  data: { quantity: 10 },
});
```

#### Update Many
**Mongoose:**
```typescript
await Product.updateMany(
  { category: 'Laptop' },
  { $inc: { quantity: 5 } }
);
```

**Prisma:**
```typescript
await prisma.product.updateMany({
  where: { category: 'Laptop' },
  data: { quantity: { increment: 5 } },
});
```

---

### 5. DELETE operatsiyalari

**Mongoose:**
```typescript
await Product.findByIdAndDelete(id);
```

**Prisma:**
```typescript
await prisma.product.delete({
  where: { id },
});
```

---

### 6. COUNT operatsiyalari

**Mongoose:**
```typescript
const count = await Product.countDocuments({ status: 'active' });
```

**Prisma:**
```typescript
const count = await prisma.product.count({
  where: { status: 'active' },
});
```

---

### 7. AGGREGATE operatsiyalari

**Mongoose:**
```typescript
const result = await Sale.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: null, total: { $sum: '$total' } } },
]);
```

**Prisma:**
```typescript
const result = await prisma.sale.aggregate({
  where: { status: 'active' },
  _sum: { total: true },
});
```

---

### 8. RELATIONS (JOIN)

**Mongoose:**
```typescript
const sales = await Sale.find()
  .populate('customer')
  .populate('createdBy')
  .lean();
```

**Prisma:**
```typescript
const sales = await prisma.sale.findMany({
  include: {
    customer: true,
    createdBy: true,
    items: true,
  },
});
```

---

### 9. TRANSACTIONS

**Mongoose:**
```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Product.updateOne({ _id: id }, { $inc: { quantity: -1 } }, { session });
  await Sale.create([saleData], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Prisma:**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.product.update({
    where: { id },
    data: { quantity: { decrement: 1 } },
  });
  await tx.sale.create({ data: saleData });
});
```

---

### 10. SEARCH (Text Search)

**Mongoose:**
```typescript
const products = await Product.find({
  $or: [
    { name: { $regex: search, $options: 'i' } },
    { barcode: { $regex: search, $options: 'i' } },
  ],
});
```

**Prisma:**
```typescript
const products = await prisma.product.findMany({
  where: {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ],
  },
});
```

---

### 11. DATE RANGE

**Mongoose:**
```typescript
const sales = await Sale.find({
  date: {
    $gte: new Date(from),
    $lte: new Date(to),
  },
});
```

**Prisma:**
```typescript
const sales = await prisma.sale.findMany({
  where: {
    date: {
      gte: new Date(from),
      lte: new Date(to),
    },
  },
});
```

---

### 12. SELECT (Specific Fields)

**Mongoose:**
```typescript
const products = await Product.find()
  .select('name price quantity')
  .lean();
```

**Prisma:**
```typescript
const products = await prisma.product.findMany({
  select: {
    name: true,
    price: true,
    quantity: true,
  },
});
```

---

### 13. PAGINATION

**Mongoose:**
```typescript
const products = await Product.find()
  .skip(page * limit)
  .limit(limit)
  .lean();
```

**Prisma:**
```typescript
const products = await prisma.product.findMany({
  skip: page * limit,
  take: limit,
});
```

---

### 14. EXISTS Check

**Mongoose:**
```typescript
const exists = await Product.exists({ barcode: '000001' });
```

**Prisma:**
```typescript
const product = await prisma.product.findFirst({
  where: { barcode: '000001' },
  select: { id: true },
});
const exists = !!product;
```

---

## 🔄 Migration qadamlari:

1. ✅ Prisma schema yaratildi
2. ⏳ PostgreSQL o'rnatish
3. ⏳ Migration ishga tushirish
4. ⏳ API route'larni o'zgartirish (50+ fayl)
5. ⏳ Test qilish

## 📝 Keyingi qadam:

Sizga kerak:
1. PostgreSQL o'rnating
2. `.env.local` da `DATABASE_URL` ni to'g'rilang
3. `npx prisma migrate dev --name init` ishga tushiring
4. Men barcha API route'larni o'zgartiraman

Davom ettirishni xohlaysizmi?
