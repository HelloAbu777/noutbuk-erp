# Telegram Shaxsiy Akkaunt Ulanish

## 📱 Nima uchun kerak?

Telegram Bot o'rniga **sizning shaxsiy Telegram akkauntingiz** orqali mijozlarga xabar yuborish uchun.

**Farqi:**
- ❌ Bot: "MyBot tomonidan" deb ko'rinadi
- ✅ Shaxsiy akkaunt: Sizning nomingizdan yuboriladi

---

## 🔧 1-QADAM: Telegram API olish

### my.telegram.org saytiga kiring:

1. **Brauzerda oching:** https://my.telegram.org
2. **Telefon raqamingizni kiriting** (+998901234567)
3. **Telegramga kod keladi** - kodni kiriting
4. **"API development tools" tugmasini bosing**
5. **Forma to'ldiring:**
   - App title: `Noutbuk ERP`
   - Short name: `noutbuk_erp`
   - Platform: `Web`
6. **"Create application" bosing**

### Natija:
```
api_id: 12345678
api_hash: 1234567890abcdef1234567890abcdef
```

---

## 🔧 2-QADAM: .env.local ga qo'shish

`.env.local` faylini oching va qo'shing:

```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=1234567890abcdef1234567890abcdef
```

**MUHIM:** Bu ma'lumotlarni hech kimga bermang!

---

## 🔧 3-QADAM: Vercel'ga qo'shish

Vercel dashboard'da:

1. **Project Settings > Environment Variables**
2. **Qo'shing:**
   - `TELEGRAM_API_ID` = `12345678`
   - `TELEGRAM_API_HASH` = `1234567890abcdef1234567890abcdef`
3. **Save**
4. **Redeploy** qiling

---

## 🚀 4-QADAM: Saytda ulanish

### Sozlamalar > Telegram bo'limida:

1. **"Telegram Akkaunt" bo'limini toping**
2. **Telefon raqamingizni kiriting** (+998901234567)
3. **"Kod yuborish" tugmasini bosing**
4. **Telegramingizga kod keladi** (12345)
5. **Kodni saytga kiriting**
6. **"Tasdiqlash" tugmasini bosing**
7. ✅ **Tayyor!** Akkaunt ulandi

---

## 📤 Qanday ishlaydi?

### Avtomatik xabar yuboriladi:

**1. Nasiya yozilganda:**
```
Assalomu alaykum, Karimova Dilnoza!

Sizda 500,000 so'm nasiya bor.
Muddat: 15.02.2025

Rahmat!
Noutbuk ERP
```

**2. To'lov qilinganda:**
```
Assalomu alaykum, Karimova Dilnoza!

300,000 so'm to'lov qabul qilindi.
Qolgan qarz: 200,000 so'm

Rahmat!
```

**3. Xabar bo'limidan:**
- Mijoz telefon raqamini tanlaysiz
- Xabar yozasiz
- Yuborish - sizning nomingizdan yuboriladi

---

## ⚠️ Muhim eslatmalar:

1. **Xavfsizlik:**
   - API ID va Hash ni hech kimga bermang
   - .env.local faylini git'ga qo'shmang (gitignore'da bor)

2. **Telegram qoidalari:**
   - Spam yubormang
   - Faqat kerakli xabarlar yuboring
   - Aks holda akkaunt bloklanishi mumkin

3. **Session:**
   - Bir marta ulanasiz
   - Session database'da saqlanadi
   - Qayta ulanish kerak emas

4. **Chiqish:**
   - Agar chiqmoqchi bo'lsangiz
   - Sozlamalar'da "Chiqish" tugmasi bo'ladi
   - Session o'chiriladi

---

## 🐛 Muammolar:

### "API ID yoki Hash noto'g'ri"
- my.telegram.org'dan qayta oling
- .env.local'da to'g'ri yozilganini tekshiring

### "Kod noto'g'ri"
- Telegramdan kelgan kodni to'g'ri kiriting
- Kod 5 daqiqa amal qiladi

### "Session expired"
- Qayta ulanish kerak
- Sozlamalar > Telegram > Qayta ulanish

---

## ✅ Tayyor!

Endi mijozlarga sizning nomingizdan avtomatik xabar yuboriladi! 🎉
