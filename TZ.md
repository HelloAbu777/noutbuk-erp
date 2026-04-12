# Noutbuk Do'koni ERP Tizimi — Texnik Topshiriq (TZ)

**Versiya:** 1.0  
**Sana:** 11.04.2026  
**Buyurtmachi:** Abdullo  
**Tuzuvchi:** Claude (AI)

---

## 1. UMUMIY MA'LUMOT

| Parametr | Qiymat |
|---|---|
| Loyiha nomi | Noutbuk Do'koni ERP Tizimi |
| Tizim turi | Web-based ERP |
| Asosiy faoliyat | Noutbuk va aksessuarlar savdosi |
| Asosiy rang | Oq `#FFFFFF` |
| Aksent rang | Och ko'k `#3B82F6` |
| UI rejimi | Light Mode / Dark Mode (toggle) |
| Platforma | Web (Desktop-first) |
| Ma'lumotlar | localStorage (keyin backend ga ko'chirish mumkin) |

---

## 2. ROL TIZIMI

| Rol | Kirish huquqi |
|---|---|
| **Admin** | Barcha bo'limlarga to'liq kirish |
| **Kassir** | Sotuv, Buyurtmalar, Mijozlar, Nasiya, Xabar |
| **Yordamchi** | Faqat Yordamchi sahifasi |

- Har bir foydalanuvchi login + parol bilan kiradi
- Sahifalar URL orqali himoyalangan (rol tekshiruvi)
- Sessiya localStorage da saqlanadi

---

## 3. UMUMIY INTERFEYS QOIDALARI

### 3.1 Sidebar (Chap navigatsiya paneli)

Barcha sahifalarda doimiy, ro'yxat:

```
Bosh sahifa
Sotuv
Buyurtmalar
Tovarlar
Ombor
Mijozlar
Nasiya
Ta'minotchilar
Xaridlar
Xarajatlar
Sheriklar
Sherikdan olish
Agentlar
Hisobotlar
Xabar
Sozlamalar
```

- Aktiv sahifa ko'k rang bilan ajratiladi
- Foydalanuvchi roliga mos bo'lmagan bo'limlar ko'rinmaydi

### 3.2 Header (Har bir sahifada)

```
[Sahifa nomi]          [☀️/🌙 Toggle]  [Avatar | Ism ▼]  [Chiqish]
```

- Avatar: profil rasmi bo'lsa rasm, bo'lmasa ismning bosh harfi (ko'k fon)
- Dark/Light holati `localStorage` ga saqlanadi

---

## 4. BO'LIMLAR TEXNIK TAVSIFI

---

### 4.1 BOSH SAHIFA (Dashboard)

#### Statistika kartochkalari — 4 ta (birinchi qatorda)

| # | Nomi | Hisob | Rang |
|---|---|---|---|
| 1 | Sotuv | So'nggi 7 kun jami sotuv | Ko'k |
| 2 | Daromad | Σ(sotuv narxi − sotib olish narxi) × soni | Yashil |
| 3 | Xarajatlar | Shu haftadagi kompaniya xarajatlari | Qizil |
| 4 | Sof foyda | Daromad − Xarajatlar | Yashil / Qizil (ishorasiga qarab) |

**Formulalar:**
```
Daromad   = Σ (sotuv_narxi − sotib_olish_narxi) × soni
Sof foyda = Daromad − Xarajatlar
```

#### 7 kunlik grafik

- Tur: Chiziqli grafik (Chart.js)
- X o'qi: Sanalar (bugun dan 6 kun orqaga)
- Y o'qi: Summa (so'm)
- Hover: Aniq summa va sana ko'rinadi

#### Top 10 mahsulot (grafikdan pastda)

- Shu haftada eng ko'p sotilgan 10 mahsulot jadvali
- Ustunlar: №, Mahsulot nomi, Soni, Sotuv narxi, Jami

---

### 4.2 SOTUV

#### Sahifa tuzilmasi

```
[🔍 Qidirish]  [📷 Skaner]                    [🛒 Savat (N ta)]
──────────────────────────────────────────────────────────────
[Mahsulot kartochkalari — grid ko'rinish, 4-6 ustun]
```

#### Qidirish va tanlash

- Qidiruv: mahsulot nomi yoki barkodi bo'yicha real-time filtr
- **Skaner tugmasi:** Kamera orqali barkod o'qiladi → avtomatik savatga +1
- Mahsulot kartochkasiga bosish → savatga +1 qo'shiladi

#### Savatcha (o'ng panel yoki modal)

```
Mahsulot          Soni  [−][+]  Narx        Jami
─────────────────────────────────────────────────
Asus Vivobook 15   1           5,500,000   5,500,000
HP USB mouse       2           60,000        120,000
─────────────────────────────────────────────────
                              JAMI:       5,620,000 so'm

To'lov turi:  [💵 Naqt]  [💳 Karta]  [📋 Nasiya]

[✅ Sotuvni yakunlash]   [🗑️ Savatni tozalash]
```

#### To'lov qoidalari

| Tur | Shart |
|---|---|
| Naqt | Har kim (ro'yxatdan o'tmagan ham) |
| Karta | Har kim |
| Nasiya | FAQAT `Mijozlar` bo'limida ro'yxatga olingan doimiy mijozlar |

- Nasiya tanlanganda: Mijozlar ro'yxatidan tanlash modali chiqadi
- Ro'yxatdan o'tmagan inson nasiya ololmaydi → xato xabari

#### Sotuvdan keyin

- Inventar avtomatik kamayadi (Tovarlar bo'limida)
- Hisobotlarga yoziladi
- Nasiyada: `Nasiya` bo'limiga yangi yozuv qo'shiladi
- Chek chiqarish imkoni (browser print yoki PDF)

---

### 4.3 YORDAMCHI SAHIFASI

> Faqat **Yordamchi** roli uchun. Mijoz bilan birga yuradi, mahsulot skanerlaydi, kassirga yuboradi.

#### Sahifa tuzilmasi (ikki ustun)

```
┌──────────────────────────┬─────────────────────────┐
│  MAHSULOTLAR  (chap 50%) │   SAVATCHA   (o'ng 50%) │
│                          │                         │
│  [🔍 Qidirish]           │  Mahsulot | Soni | ∑    │
│  [📷 Skaner]             │  ──────────────────     │
│                          │  Asus V15   1   5.5M    │
│  [Mahsulot kartochkalar] │  HP Mouse   2   0.12M   │
│  Tanlaganda:             │                         │
│  Miqdor: [___] [Enter]   │  JAMI: 5,620,000        │
│                          │  ──────────────────     │
│                          │  [👤 Mijoz tanlash]     │
│                          │  [➕ Yangi mijoz]       │
│                          │  [📨 Kassirga yuborish] │
└──────────────────────────┴─────────────────────────┘
```

#### Mahsulot qo'shish usullari

1. **Skaner:** Barkod o'qiladi → avtomatik savatga +1
2. **Qo'lda:** Mahsulotga bosish → miqdor kiritish → `Enter` yoki tugma

#### Yangi mijoz modali

```
Ism:     [__________]
Telefon: [__________]
[Saqlash]
```
→ Saqlangach `Mijozlar` bo'limiga avtomatik qo'shiladi

#### Kassirga yuborish

- Yuborilgach buyurtma **Admin** va **Kassir** sahifalaridagi `Buyurtmalar` bo'limida ko'rinadi
- Yordamchi sahifasidan o'chib ketadi
- Holati: `Kutilmoqda`

---

### 4.4 BUYURTMALAR

#### Ko'rish qoidasi

- Admin qabul qilsa → Kassirda ko'rinmaydi
- Kassir qabul qilsa → Adminda ko'rinmaydi
- Qabul qilgan shaxsning savatiga tushadi

#### Buyurtma kartochkasi

```
Yordamchi: Jasur               Vaqt: 14:32
Mijoz: Alisher Karimov         Tel: +998901234567

Mahsulotlar:
  - Asus Vivobook 15 × 1      5,500,000 so'm
  - HP USB sichqoncha × 2       120,000 so'm
                   ──────────────────────────
                   JAMI:       5,620,000 so'm

[✅ Qabul qilish]    [❌ Bekor qilish]
```

#### Holat filtrlari

`Kutilmoqda` | `Tasdiqlangan` | `Bekor qilingan`

#### Qabul qilgandan keyin

- Mahsulotlar qabul qilgan shaxs savatiga tushadi
- To'lov yakunlangach → `Tasdiqlangan`
- Bekor → `Bekor qilingan`, inventar o'zgarmaydi

---

### 4.5 TOVARLAR

> Do'konda sotuvga tayyor mahsulotlar

#### Interfeys

```
[🔍 Qidirish]                              [➕ Mahsulot qo'shish]

Nomi | Kategoriya | Sotib olish | Sotuv narxi | Qoldiq | Amallar
────────────────────────────────────────────────────────────────
Asus  |  Noutbuk  |  5,000,000  |  5,500,000  |  12   |  ✏️ 🗑️
HP    |  Noutbuk  |  3,800,000  |  4,200,000  |   8   |  ✏️ 🗑️
```

#### Mahsulot qo'shish / tahrirlash modali

```
Mahsulot nomi:      [__________]
Kategoriya:         [Noutbuk ▼]
Sotib olish narxi:  [__________]
Ustama (%):         [__________]  →  Sotuv narxi: avtomatik
Soni:               [__________]
Tavsif:             [__________]
Barkod:             [__________]  [📷 Skaner]
[Saqlash]
```

#### Qoidalar

- Tahrirlangan mahsulot `Sotuv` bo'limida avtomatik yangilanadi
- O'chirish: arxivga o'tadi (tarix saqlanadi)

---

### 4.6 OMBOR

> Sotuvga chiqarilmagan, hali do'konda ko'rinmaydigan mahsulotlar

#### Oqim

```
Yangi tovar keladi → Ombor → [Do'konga chiqarish] → Tovarlar → Sotuv
```

#### Interfeys

```
[➕ Yangi mahsulot]    [🔍 Qidirish]

Nomi | Soni | Sotib olish | Sotuv narxi | Tavsif | Amallar
──────────────────────────────────────────────────────────
Asus |  20  |  5,000,000  |  5,500,000  |  ...   | [Do'konga chiqarish] ✏️
```

#### Qoidalar

- `Do'konga chiqarish` tugmasi faqat soni > 0 bo'lganda ko'rinadi
- Do'konga chiqarilganda `Tovarlar` ga yangi yozuv qo'shiladi

---

### 4.7 MIJOZLAR

> Doimiy mijozlar — nasiya berish uchun ro'yxat

#### Interfeys

```
[🔍 Qidirish]                              [➕ Mijoz qo'shish]

Ism familiya | Telefon       | Manzil    | Qarz
──────────────────────────────────────────────────────
Alisher K.   | +998901234567 | Toshkent  | 🔴 2,500,000
Zulfiya M.   | +998931112233 | Samarqand | ✅ 0
```

#### Mijoz qo'shish modali

```
Ism familiya: [__________]
Telefon:      [__________]
Manzil:       [__________]
[Saqlash]
```

#### Mijoz kartiga bosish

→ O'sha mijozning nasiya tarixi va sotuvlar tarixi ko'rinadi

---

### 4.8 NASIYA

> Qarzga berilgan mahsulotlar va holati

#### Statistika kartochkalari — 4 ta

| # | Nomi | Ma'lumot |
|---|---|---|
| 1 | Jami nasiya | Barcha ochiq qarzlar yig'indisi |
| 2 | Ochiq qarzlar | To'lanmagan qarzlar soni |
| 3 | Muddati o'tganlar | Belgilangan sanadan o'tib ketganlar |
| 4 | Yopilganlar | To'liq to'langan qarzlar |

#### Ro'yxat (2 ko'rinish: jadval / kartochkalar)

**Jadval ustunlari:**
```
Mijoz | Telefon | Mahsulot | Summa | Berilgan sana | Muddat | Holat | Amallar
```

**Holat ranglari:**
- Yashil: To'langan
- Sariq: Muddatida
- Qizil: Muddati o'tgan

#### To'lov qabul qilish

- `To'lov` tugmasi → qisman yoki to'liq summa kiritish
- To'liq → holat `Yopilgan` ga o'tadi
- Avtomatik SMS bildirishnoma (agar Telegram sozlangan bo'lsa)

---

### 4.9 TA'MINOTCHILAR

#### Interfeys

```
[🔍 Qidirish]  [📋 Jadval / 🃏 Kartochka]   [➕ Ta'minotchi qo'shish]

Kompaniya | Kontakt | Telefon | Manzil | Jami xarid | Qarz | Amallar
```

#### Qo'shish modali

```
Kompaniya nomi: [__________]
Kontakt shaxsi: [__________]
Telefon:        [__________]
Manzil:         [__________]
[Saqlash]
```

#### Qarz hisobi

- Ta'minotchiga to'langan summa vs jami xarid narxi → qarz avtomatik

---

### 4.10 XARIDLAR

> Ta'minotchilardan olingan mahsulotlar

#### Interfeys

```
[📅 Dan: ____]  [📅 Gacha: ____]             [➕ Yangi xarid]

Ta'minotchi | Tovar | Miqdor | Narx | To'langan | Qoldiq | Izoh
```

#### Yangi xarid modali

```
Ta'minotchi:  [Tanlash ▼]
Tovar:        [__________]
Miqdor:       [__________]
Narx (jami):  [__________]
To'langan:    [__________]
Izoh:         [__________]
[Saqlash]
```

#### Oqim

Yangi xarid saqlangach → mahsulot avtomatik **Ombor** ga qo'shiladi

---

### 4.11 XARAJATLAR

#### Kategoriyalar (tab ko'rinish)

`Hammasi` | `Ijara` | `Maosh` | `Transport` | `Boshqa`

#### Interfeys

```
[➕ Xarajat qo'shish]

Jami: 12,500,000 so'm   |   Oy bo'yicha: 3,200,000 so'm

[🔍 Qidirish]

Kategoriya | Summa | Izoh | Sana | Amallar
```

#### Xarajat qo'shish modali

```
Kategoriya: [Ijara ▼]
Summa:      [__________]
Izoh:       [__________]
Sana:       [📅 __________]
[Saqlash]
```

---

### 4.12 SHERIKLAR

> Boshqa biznes egalari

#### Interfeys

```
[➕ Sherik qo'shish]

Sherik nomi | Telefon | Jami bergan | Jami olgan | Qoldiq | Amallar
```

#### Qo'shish modali

```
Do'kon nomi: [__________]
Telefon:     [__________]
Manzil:      [__________]
Izoh:        [__________]
[Saqlash]
```

---

### 4.13 SHERIKDAN OLISH

#### Interfeys

```
[➕ Sherik olish]

Sherik | Tovar turi | Miqdor | Narx | Izoh | Sana
```

#### Modal

```
Sherik:     [Tanlash ▼]
Tovar turi: [__________]
Miqdor:     [__________]
Narx:       [__________]
Izoh:       [__________]
[Saqlash]
```

---

### 4.14 AGENTLAR

#### Interfeys

```
[🔍 Qidirish]                    [➕ Agent qo'shish]

Ism | Telefon | Manzil | Holat (Faol/Nofaol) | Amallar (✏️ 🗑️)
```

---

### 4.15 HISOBOTLAR

#### Vaqt filtri (tab + custom)

`Bugun` | `1 Hafta` | `1 Oy` | `[📅 Dan] — [📅 Gacha]`

#### Statistika kartochkalari — 4 ta

| # | Nomi | Ma'lumot |
|---|---|---|
| 1 | Jami sotuv | Tanlangan davrdagi sotuv summasi |
| 2 | Daromad | Margin (sotuv − sotib olish) |
| 3 | Xarajatlar | Davr xarajatlari |
| 4 | Sof foyda | Daromad − Xarajatlar |

#### Grafik

- Sana o'zgarganda avtomatik qayta chiziladi
- X: Sanalar, Y: Summa

#### Top 10 mahsulot

- Tanlangan davrdagi eng ko'p xarid qilingan 10 mahsulot
- Ustunlar: №, Nomi, Soni, Narx

#### Nasiya holati (eng pastda)

```
Jami nasiya: 15 ta  |  To'langan: 9 ta  |  Muddati o'tgan: 3 ta
```

---

### 4.16 XABARLAR

#### Statistika kartochkalari — 4 ta

| # | Nomi |
|---|---|
| 1 | Jami yuborilgan xabarlar |
| 2 | Javob berilganlar |
| 3 | Xato / Yuborilmaganlar |
| 4 | Navbatda turganlar |

#### Interfeys

```
[🔍 Qidirish]  [🗑️ O'chirish]  [🔄 Yangilash]  [➕ Xabar yuborish]

Mijoz | Telefon | Turi | Xabar matni | Holat | Vaqt
```

#### Xabar turlari

- Qarz eslatmasi
- Naqt sotuv tasdigi
- Qarz to'landi bildirishnomasi

---

### 4.17 SOZLAMALAR

#### Bo'limlar (tab)

**1. Do'kon ma'lumotlari**

```
Do'kon nomi:    [__________]
Manzil:         [__________]
Telefon:        [__________]
Chek matni:     [__________]   ← Chekda ko'rinadigan matn
[Saqlash]

── Kategoriyalar ──
Mavjud kategoriyalar + [➕ Yangi kategoriya]
```

**2. Telegram**

```
Bot token:        [__________]
Chat ID:          [__________]
Bildirishnomalar: [Nasiya ☑] [Sotuv ☑] [Xarid ☑]
Bot holati:       [Yoq / O'chir]
[Saqlash]
```

**3. Foydalanuvchilar**

```
[🔍 Qidirish]                    [➕ Ishchi qo'shish]

Ism familiya | Login | Rol | Holat | Amallar
```

Ishchi qo'shish modali:
```
Ism familiya: [__________]
Telefon:      [__________]
Rol:          [Admin / Kassir / Yordamchi ▼]
Login:        [__________]
Parol:        [__________]   ← Ko'rinmaydi (type=password)
[Saqlash]
```

**4. Profil**

```
Ism:     [__________]
Lavozim: Kassir  (o'zgarmaydi)
─────────────────────────────
Parolni yangilash:
  Joriy parol:  [__________]
  Yangi parol:  [__________]
  Tasdiqlash:   [__________]
[Saqlash]
```

**5. Zaxira nusxa**

```
[⬇️ JSON yuklab olish]   ← Barcha ma'lumotlar eksport
[⬆️ JSON yuklash]        ← Zaxiradan tiklash
```

---

## 5. MA'LUMOTLAR OQIMI (FLOW)

```
[Yangi tovar keldi]
        │
        ▼
   [XARIDLAR]  ←── Ta'minotchi tanlash, narx kiritish
        │
        ▼
     [OMBOR]   ←── Avtomatik qo'shiladi
        │
    "Do'konga chiqarish" tugmasi
        │
        ▼
   [TOVARLAR]  ←── Sotuvga tayyor
        │
        ▼
  ┌─────┴─────┐
  │           │
[SOTUV]  [YORDAMCHI]
  │           │  → Kassirga yuborish
  │        [BUYURTMALAR]
  │           │  → Qabul qilish
  │           ▼
  └──→  To'lov turi:
           Naqt / Karta → Savdo yakunlandi → [HISOBOTLAR]
           Nasiya        → [NASIYA] → To'lov kutilmoqda
```

---

## 6. TEXNIK TALABLAR

| Parametr | Tavsif |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS (yoki React) |
| Backend | Node.js / Express (yoki PHP) |
| Ma'lumotlar bazasi | SQLite (kichik) / PostgreSQL (katta) |
| Barkod skaner | Web kamera — `QuaggaJS` yoki `ZXing-js` |
| Grafik | `Chart.js` |
| Chek | Browser print yoki `jsPDF` |
| SMS / Bildirishnoma | Telegram Bot API yoki Eskiz SMS |
| Zaxira | JSON eksport / import |
| Autentifikatsiya | JWT token yoki Session |
| Xavfsizlik | SQL injection himoyasi, XSS himoyasi, HTTPS |

---

## 7. BOSHLANG'ICH FOYDALANUVCHILAR (Default)

| Ism | Login | Parol | Rol |
|---|---|---|---|
| Abdullo (Ega) | admin | (o'rnatiladi) | Admin |
| Kassir | kassir | (o'rnatiladi) | Kassir |
| Yordamchi | yordam | (o'rnatiladi) | Yordamchi |

---

## 8. ANIQLANGAN KAMCHILIKLAR VA TUZATISHLAR

| # | Muammo | Tuzatish |
|---|---|---|
| 1 | Nasiya bo'limi ro'yxatida tovar/ombor ustunlari tasvirlangan — bu xato | To'g'ri: mijoz ismi, summa, muddat, holat |
| 2 | Yordamchi sahifasida sidebar kerak emas | Faqat o'z ish sahifasi ko'rinadi |
| 3 | Nasiya qo'shishda qaytarish muddati maydoni yo'q edi | Modal da "Qaytarish muddati" maydoni qo'shildi |
| 4 | Xarid qilinganda ombor bilan bog'liqlik aniqlanmagan edi | Xarid saqlangach → Ombor ga avtomatik boradi |
| 5 | Chek formati aniqlanmagan edi | Sozlamalar → Do'kon ma'lumotlari da chek matni sozlanadi |

---

## 9. RIVOJLANTIRISH BOSQICHLARI (Tavsiya)

| Bosqich | Tarkib |
|---|---|
| **1-bosqich** | Login, Sidebar, Bosh sahifa, Sotuv, Tovarlar |
| **2-bosqich** | Ombor, Xaridlar, Mijozlar, Nasiya, Buyurtmalar |
| **3-bosqich** | Yordamchi sahifasi, Ta'minotchilar, Xarajatlar |
| **4-bosqich** | Sheriklar, Agentlar, Hisobotlar, Xabarlar |
| **5-bosqich** | Sozlamalar, Zaxira, Telegram integratsiya, Chek |

---

*TZ yakunlandi. Kod yozishga ruxsat berilganda 1-bosqichdan boshlanadi.*
