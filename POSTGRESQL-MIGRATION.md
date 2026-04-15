# MongoDB dan PostgreSQL ga O'tish Qo'llanmasi

## ✅ Qilingan ishlar:

1. ✅ Prisma o'rnatildi
2. ✅ Prisma schema yaratildi (barcha 16 ta model)
3. ✅ Database index'lar qo'shildi
4. ✅ Prisma client sozlandi

## 📋 Keyingi qadamlar:

### 1. PostgreSQL o'rnatish

#### Windows uchun:
```bash
# PostgreSQL yuklab oling:
https://www.postgresql.org/download/windows/

# Yoki Chocolatey orqali:
choco install postgresql

# pgAdmin 4 bilan birga o'rnatiladi
```

#### O'rnatishdan keyin:
1. PostgreSQL ishga tushiring (Windows Service)
2. pgAdmin 4 ochib, yangi database yarating: `qaqnus`
3. Username va password eslab qoling

### 2. .env.local faylini yangilash

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/qaqnus?schema=public"
```

**Format:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Misol:**
```
DATABASE_URL="postgresql://postgres:12345@localhost:5432/qaqnus?schema=public"
```

### 3. Prisma migration ishga tushirish

```bash
# Database schema yaratish
npx prisma migrate dev --name init

# Prisma Client generate qilish
npx prisma generate
```

Bu barcha jadvallarni yaratadi va index'larni o'rnatadi.

### 4. Ma'lumotlarni ko'chirish (opsional)

Agar MongoDB'dagi ma'lumotlarni saqlamoqchi bo'lsangiz:

```bash
# Migration script ishga tushirish
npm run migrate-data
```

**Eslatma:** Bu script hali yaratilmagan. Kerak bo'lsa, men yarataman.

### 5. API route'larni yangilash

Barcha API route'larda:

**Eski (MongoDB):**
```typescript
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';

await connectDB();
const products = await Product.find();
```

**Yangi (PostgreSQL):**
```typescript
import prisma from '@/lib/prisma';

const products = await prisma.product.findMany();
```

### 6. Vercel Postgres (Production uchun)

Vercel'da PostgreSQL database yaratish:

1. Vercel Dashboard → Storage → Create Database
2. Postgres tanlang
3. Database yaratilgandan keyin, connection string oling
4. Vercel Environment Variables'ga qo'shing:
   ```
   DATABASE_URL=postgres://...
   ```

## 🔄 Migration strategiyasi:

### Variant 1: Yangi boshdan (tavsiya)
- PostgreSQL o'rnating
- Migration ishga tushiring
- Demo ma'lumotlar qo'shing
- Test qiling

### Variant 2: Ma'lumotlarni ko'chirish
- MongoDB'dan export qiling
- PostgreSQL'ga import qiling
- ID'larni moslashtiring

## 📊 Prisma vs Mongoose farqlari:

| Operatsiya | Mongoose | Prisma |
|------------|----------|--------|
| Find all | `Model.find()` | `prisma.model.findMany()` |
| Find one | `Model.findById(id)` | `prisma.model.findUnique({ where: { id } })` |
| Create | `Model.create(data)` | `prisma.model.create({ data })` |
| Update | `Model.findByIdAndUpdate(id, data)` | `prisma.model.update({ where: { id }, data })` |
| Delete | `Model.findByIdAndDelete(id)` | `prisma.model.delete({ where: { id } })` |
| Count | `Model.countDocuments()` | `prisma.model.count()` |

## 🚀 Afzalliklari:

1. **Tezlik**: PostgreSQL local'da juda tez
2. **Type Safety**: Prisma to'liq TypeScript support
3. **Relations**: Foreign key constraints
4. **Transactions**: ACID transactions
5. **Migrations**: Database versioning

## ⚠️ Diqqat:

- Barcha API route'lar (50+ fayl) o'zgartirilishi kerak
- Bu 2-3 kun vaqt oladi
- Test qilish muhim

## 📝 Keyingi fayl:

Men endi bitta API route'ni misol sifatida o'zgartiraman, keyin siz ko'rib, davom ettirishni xohlaysizmi yoki men barchasini qilishimni xohlaysizmi?

**Tavsiya:** Birinchi test qiling, keyin barchasini o'zgartiring.
