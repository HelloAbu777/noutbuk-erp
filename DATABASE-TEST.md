# Database Tekshirish va Demo Ma'lumotlar

## ✅ Tayyor funksiyalar

### 1. Database holatini tekshirish
**Manzil:** Sozlamalar > Zaxira > "Database holatini tekshirish" tugmasi

**Natija ko'rsatadi:**
- MongoDB ulanish holati
- Kolleksiyalar soni
- Jami yozuvlar soni
- Har bir kolleksiyadagi ma'lumotlar

**Misol natija:**
```
✅ Database ishlayapti! 12 ta kolleksiya, 156 ta yozuv
```

---

### 2. Demo ma'lumotlar qo'shish
**Manzil:** Sozlamalar > Zaxira > "Demo ma'lumotlar qo'shish" tugmasi

**Qo'shiladigan ma'lumotlar:**
- ✅ 3 ta foydalanuvchi (admin, kassir, yordamchi)
- ✅ 10 ta mahsulot (noutbuklar va aksessuarlar)
- ✅ 5 ta mijoz (2 tasi qarzli)
- ✅ 3 ta ta'minotchi
- ✅ 3 ta ishchi
- ✅ 3 ta sotuv (bugun, kecha, 2 kun oldin)
- ✅ 4 ta xarajat
- ✅ 2 ta nasiya (ochiq)
- ✅ 3 ta ombor yozuvi
- ✅ 2 ta buyurtma (kutilmoqda)
- ✅ Sozlamalar

**Demo login ma'lumotlari:**
```
Admin:     login: admin    | parol: admin123
Kassir:    login: kassir   | parol: kassir123
Yordamchi: login: yordam   | parol: yordam123
```

---

### 3. Barcha ma'lumotlarni 0 ga qaytarish
**Manzil:** Sozlamalar > Zaxira > "Barcha ma'lumotlarni 0 ga qaytarish" tugmasi

**Nima o'chiriladi:**
- ❌ Barcha sotuvlar
- ❌ Barcha xaridlar
- ❌ Barcha xarajatlar
- ❌ Barcha nasiyalar
- ❌ Barcha buyurtmalar
- ❌ Barcha xabarlar
- ❌ Barcha ombor yozuvlari
- ✅ Mahsulotlar miqdori 0 ga
- ✅ Mijozlar qarzi 0 ga

**Saqlanadi:**
- ✅ Foydalanuvchilar
- ✅ Mahsulotlar (faqat miqdor 0)
- ✅ Mijozlar (faqat qarz 0)
- ✅ Ishchilar
- ✅ Ta'minotchilar
- ✅ Sozlamalar

---

## 🚀 Qanday ishlatish

### Birinchi marta ishlatish:
1. Saytga kiring: https://noutbuk-erp.vercel.app
2. Hozirgi login bilan kiring (admin)
3. Sozlamalar > Zaxira bo'limiga o'ting
4. "Database holatini tekshirish" bosing - ishlayotganini ko'ring
5. "Demo ma'lumotlar qo'shish" bosing
6. 3 soniya kuting - sahifa avtomatik yangilanadi
7. Barcha bo'limlarni ko'rib chiqing!

### Qayta boshlash:
1. Sozlamalar > Zaxira
2. "Barcha ma'lumotlarni 0 ga qaytarish" bosing
3. Tasdiqlang (2 marta)
4. Keyin "Demo ma'lumotlar qo'shish" bosing

---

## 📊 Demo ma'lumotlar tafsiloti

### Mahsulotlar (10 ta):
- Asus VivoBook 15 (15 dona, 5,200,000 so'm)
- HP 15s-fq5000 (12 dona, 4,400,000 so'm)
- Lenovo IdeaPad 3 (8 dona, 5,900,000 so'm)
- Acer Aspire 5 (10 dona, 5,500,000 so'm)
- Dell Inspiron 15 (6 dona, 6,200,000 so'm)
- Apple MacBook Air M2 (3 dona, 14,500,000 so'm)
- Logitech MX Keys (20 dona, 450,000 so'm)
- HP USB Mouse (35 dona, 80,000 so'm)
- TP-Link Wi-Fi Adapter (25 dona, 120,000 so'm)
- SanDisk 256GB Flash (30 dona, 140,000 so'm)

### Mijozlar (5 ta):
- Aliyev Sardor (qarz yo'q)
- Karimova Dilnoza (500,000 so'm qarz)
- Rahimov Jasur (qarz yo'q)
- Toshmatova Nigora (1,200,000 so'm qarz)
- Ergashev Otabek (qarz yo'q)

### Sotuvlar (3 ta):
- Bugun: HP noutbuk + mouse = 4,480,000 so'm
- Kecha: 2 ta Asus noutbuk = 10,400,000 so'm (karta)
- 2 kun oldin: Aksessuarlar = 1,630,000 so'm

---

## 🔧 Lokal test (agar internet bo'lsa)

```bash
# Database ulanishini tekshirish
npm run test-db

# Demo ma'lumotlar qo'shish
npm run seed-demo

# Barcha ma'lumotlarni 0 ga qaytarish
npm run reset

# Mahsulotlar miqdorini 100 ga o'zgartirish
npm run set-quantity
```

---

## ⚠️ Muhim eslatmalar

1. **Internet kerak** - MongoDB Atlas cloud database ishlatiladi
2. **Faqat admin** - Bu funksiyalarni faqat admin ishlatishi mumkin
3. **Qaytarib bo'lmaydi** - Reset qilgandan keyin ma'lumotlar yo'qoladi
4. **Vercel'da ishlaydi** - Lokal kompyuterda internet muammosi bo'lsa, Vercel'dan foydalaning

---

## 📝 Keyingi qadamlar

✅ Database tekshirish - TAYYOR
✅ Demo ma'lumotlar - TAYYOR
✅ Reset funksiyasi - TAYYOR
✅ Deploy - TAYYOR

Endi saytga kirib, "Database holatini tekshirish" tugmasini bosing!
