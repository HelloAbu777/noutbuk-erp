# Sahifalar Sekin Ochilish Muammosi va Yechimlar

## Muammolar:
1. **Database query'lar sekin** (5-20 soniya)
2. **Next.js compilation sekin** (50-60 soniya)
3. **Vercel MongoDB uzoq masofada**

## Yechimlar:

### 1. LOCAL MONGODB O'RNATISH (ENG YAXSHI)

#### Windows uchun:
```bash
# MongoDB Community Edition yuklab oling:
# https://www.mongodb.com/try/download/community

# Yoki Chocolatey orqali:
choco install mongodb

# MongoDB ishga tushiring:
mongod --dbpath C:\data\db
```

#### .env.local faylini yangilang:
```env
# Hozirgi (sekin):
MONGODB_URI=mongodb+srv://vercel-database-url...

# Yangi (tez):
MONGODB_URI=mongodb://localhost:27017/qaqnus
```

**Natija**: Database query'lar 5-20s dan 50-200ms ga tushadi ✅

---

### 2. DATABASE INDEX QO'SHISH

Tez-tez qidirilgan maydonlarga index qo'shing:

```typescript
// models/Product.ts
productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });

// models/Customer.ts
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text' });

// models/Sale.ts
saleSchema.index({ date: -1 });
saleSchema.index({ customerId: 1 });
```

**Natija**: Query'lar 2-3x tezroq bo'ladi ✅

---

### 3. LAZY LOADING

Barcha ma'lumotlarni bir vaqtda yuklamaslik:

```typescript
// Hozirgi (sekin):
const products = await Product.find();

// Yangi (tez):
const products = await Product.find()
  .limit(50)
  .select('name barcode quantity sellPrice')
  .lean();
```

**Natija**: Kam ma'lumot yuklash = tezroq ✅

---

### 4. CACHING

React Query yoki SWR ishlatish:

```bash
npm install @tanstack/react-query
```

```typescript
// Har safar API chaqirmaslik
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000, // 5 daqiqa
});
```

**Natija**: Bir marta yuklash, keyin cache'dan olish ✅

---

### 5. NEXT.JS TURBO MODE

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

**Natija**: Compilation 2-3x tezroq ✅

---

## Tavsiya qilinadigan tartib:

1. ✅ **Birinchi**: Local MongoDB o'rnating (eng katta ta'sir)
2. ✅ **Ikkinchi**: Database index'lar qo'shing
3. ✅ **Uchinchi**: Turbo mode yoqing
4. ⏳ **Keyinroq**: React Query qo'shing

## Kutilayotgan natijalar:

| Sahifa | Hozir | Keyin |
|--------|-------|-------|
| Ombor | 9.6s | 0.3s |
| Tovarlar | 5.5s | 0.2s |
| Ta'minotchilar | 21.3s | 0.4s |
| Mijozlar | 15.8s | 0.3s |

**Jami yaxshilanish: 20-30x tezroq! 🚀**
