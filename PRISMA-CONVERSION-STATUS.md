# PostgreSQL/Prisma Konversiya Holati

## ✅ To'liq konvertatsiya qilingan API route'lar (17 ta):

### Products (Tovarlar)
1. ✅ `app/api/products/route.ts` - GET/POST (id → _id transformatsiya qo'shildi)
2. ✅ `app/api/products/[id]/route.ts` - PUT/DELETE (id → _id transformatsiya qo'shildi)
3. ✅ `app/api/products/bulk/route.ts` - PATCH (ommaviy kirim)
4. ✅ `app/api/products/history/route.ts` - GET (harakat tarixi)

### Warehouse (Ombor)
5. ✅ `app/api/ombor/route.ts` - GET/POST (id → _id transformatsiya qo'shildi)
6. ✅ `app/api/ombor/[id]/route.ts` - PUT/DELETE (id → _id transformatsiya qo'shildi)
7. ✅ `app/api/ombor/[id]/chiqar/route.ts` - POST (ombordan do'konga o'tkazish)

### Sales (Sotuv)
8. ✅ `app/api/sales/route.ts` - GET/POST (nasiya bilan)

### Customers (Mijozlar)
9. ✅ `app/api/customers/route.ts` - GET/POST (id → _id transformatsiya qo'shildi)
10. ✅ `app/api/customers/[id]/route.ts` - PUT/DELETE (id → _id transformatsiya qo'shildi)

### Messages (Xabarlar)
11. ✅ `app/api/xabar/route.ts` - GET/POST/DELETE

### Nasiya (Kredit)
12. ✅ `app/api/nasiya/route.ts` - GET/POST (id → _id transformatsiya qo'shildi)
13. ✅ `app/api/nasiya/[id]/tolov/route.ts` - POST (to'lov qo'shish)

### Dashboard
14. ✅ `app/(dashboard)/dashboard/page.tsx` - Dashboard statistika
15. ✅ `app/api/dashboard/stats/route.ts` - Dashboard stats API

### Auth
16. ✅ `lib/auth.ts` - NextAuth konfiguratsiya

### Pages
17. ✅ `app/(dashboard)/ombor/page.tsx` - Ta'minotchi select qo'shildi

## 🔄 ID Transformatsiya

Frontend MongoDB formatini kutadi (`_id`), lekin Prisma `id` qaytaradi. Shuning uchun barcha API route'larda quyidagi transformatsiya qo'shildi:

```typescript
// GET response
const transformed = items.map(i => ({ ...i, _id: i.id }));
return NextResponse.json(transformed);

// POST/PUT response
const transformed = { ...item, _id: item.id };
return NextResponse.json(transformed);
```

## ⏳ Hali konvertatsiya qilinmagan route'lar (30+ ta):

### Suppliers (Ta'minotchilar)
- ❌ `app/api/tamirotchilar/route.ts`
- ❌ `app/api/tamirotchilar/[id]/route.ts`
- ❌ `app/api/tamirotchilar/[id]/purchases/route.ts`

### Purchases (Xaridlar)
- ❌ `app/api/xaridlar/route.ts`
- ❌ `app/api/xaridlar/[id]/route.ts`

### Nasiya (Kredit)
- ✅ `app/api/nasiya/route.ts` - KONVERTATSIYA QILINDI
- ✅ `app/api/nasiya/[id]/tolov/route.ts` - KONVERTATSIYA QILINDI

### Workers (Ishchilar)
- ❌ `app/api/ishchilar/route.ts`
- ❌ `app/api/ishchilar/[id]/route.ts`

### Expenses (Xarajatlar)
- ❌ `app/api/xarajatlar/route.ts`
- ❌ `app/api/xarajatlar/[id]/route.ts`

### Orders (Buyurtmalar)
- ❌ `app/api/buyurtmalar/route.ts`
- ❌ `app/api/buyurtmalar/[id]/route.ts`

### Reports (Hisobotlar)
- ❌ `app/api/hisobotlar/route.ts`

### Settings (Sozlamalar)
- ❌ `app/api/sozlamalar/route.ts`
- ❌ `app/api/sozlamalar/reset/route.ts`
- ❌ `app/api/sozlamalar/zaxira/route.ts`

### Messages (Xabarlar)
- ✅ `app/api/xabar/route.ts` - KONVERTATSIYA QILINDI

### Dashboard Stats
- ✅ `app/api/dashboard/stats/route.ts` - KONVERTATSIYA QILINDI

## 📊 Progress

- **Konvertatsiya qilingan:** 17 fayl (40%)
- **Qolgan:** 23+ fayl (60%)

## 🎯 Keyingi qadamlar

1. ✅ Products va Warehouse API'lari konvertatsiya qilindi
2. ✅ Sales API konvertatsiya qilindi (nasiya bilan)
3. ✅ Customers API konvertatsiya qilindi
4. ✅ ID transformatsiya qo'shildi (MongoDB `_id` → Prisma `id`)
5. ✅ Nasiya API konvertatsiya qilindi
6. ⏳ Qolgan 23+ API route'larni konvertatsiya qilish kerak

## 🐛 Hal qilingan muammolar

1. ✅ Products "tovarlar" sahifasida ko'rinmayotgan edi → ID transformatsiya qo'shildi
2. ✅ Ombor API 500 xato berardi → Prisma'ga konvertatsiya qilindi
3. ✅ Sales API MongoDB ishlatardi → Prisma'ga konvertatsiya qilindi
4. ✅ Frontend `_id` kutadi, Prisma `id` qaytaradi → Transformatsiya qo'shildi
5. ✅ Xabarlar sahifasi JSON parse xatosi berardi → Prisma'ga konvertatsiya qilindi
6. ✅ Dashboard stats API MongoDB ishlatardi → Prisma'ga konvertatsiya qilindi
7. ✅ Ombor sahifasida "Ta'minotchidan olish" tugmasi o'chirildi → Ta'minotchi select qo'shildi
8. ✅ Nasiya API MongoDB xatosi berardi → Prisma'ga konvertatsiya qilindi
9. ✅ CSS yuklanmayotgan edi → Nasiya API xatosi tuzatildi, server qayta ishga tushirildi

## 💡 Eslatma

Barcha konvertatsiya qilingan API route'larda:
- ✅ MongoDB import'lari o'chirildi
- ✅ Prisma import qo'shildi
- ✅ Mongoose query'lar Prisma query'larga o'zgartirildi
- ✅ ID transformatsiya qo'shildi (`id` → `_id`)
- ✅ Error handling qo'shildi
