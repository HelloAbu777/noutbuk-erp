# Xatolar va Talab Qilingan O'zgarishlar

## 1. Sotib Olish Bo'limi — Mahsulot Kartalarida Rasm
- Mahsulot kartalarida rasm yo'q yoki noto'g'ri o'lchamda
- Barcha rasmlar bir xil o'lchamda bo'lishi kerak
- Rasmlar aniq (sharp) ko'rinishi kerak

---

## 2. Barkod — Uzunligi Qisqartirish
- Hozirgi barkod juda uzun
- Barkod **6 ta son** dan iborat bo'lishi kerak

---

## 3. Barkod — Qo'lda Kiritish O'rniga Avtomatik Generatsiya
- Hozir barkodni qo'lda yozish uchun input maydoni bor
- Bu noto'g'ri — barkod **avtomatik** yaratilishi kerak
- Input maydoni o'chirilsin, tizim o'zi 6 raqamli barkod bersin

---

## 4. Tovarlar Bo'limi — Karta Dizayni Xatosi
- Checkbox va tovar nomi turli qatorda turibdi
- Ular **bir qatorda** (yonma-yon) turishi kerak
- Umumiy karta dizayni yaxshilanishi kerak

---

## 5. Tovarlar Bo'limi — Ommaviy Kirimda Son Qo'shish Xatosi
- Ommaviy kirimda miqdor qo'shilganda **avtomatik** tovarlarga qo'shilib ketmoqda
- Bu noto'g'ri — mahsulot faqat **ombordan kelganda** qo'shilishi kerak
- Qo'shish imkoni: mahsulot omboridagi **maksimal miqdordan** oshmasin

---

## 6. Ommaviy Kirim — Skaner Yo'q
- 1000 ta mahsulot bo'lsa qidirish qiyin
- Ommaviy kirimga **skaner (barcode scanner)** funksiyasi qo'shilishi kerak
- Skaner orqali mahsulot topilsin va avtomatik qo'shilsin

---

## 7. Emojilar — Icon Bilan Almashtirish
- Hozir interfeysdagi ko'p joyda emoji ishlatilgan
- Barcha emoji o'rniga **rasmiy ikonalar (icons)** ishlatilishi kerak

---

## 8. Nasiya Bo'limi — Mijoz Nomini Yozish Xatosi
- Yangi nasiya qo'shishda mijoz ismi qo'lda yozilmoqda
- Bu noto'g'ri — mijoz **tanlanishi** kerak (mavjud mijozlar ro'yxatidan)
- Qo'lda yozish o'chirilsin, dropdown/search orqali tanlash bo'lsin

---

## 9. Nasiya Bo'limi — Telefon Raqam Maydoni Keraksiz
- Yangi nasiya qo'shishda mijoz tanlangandan keyin **telefon raqam kiritish so'ralmoqda**
- Bu keraksiz — mijoz allaqachon tizimda mavjud, raqami bor
- Telefon raqam inputi **nasiya qo'shish oynasidan o'chirilsin**

---

## 10. Mijozlar Bo'limi — Mijoz Profili Ochilmaydi
- Bitta mijozga bosilganda to'liq profil oynasi ochilmaydi
- **Yangi to'liq oyna** ochilishi kerak:
  - Mijozning barcha tarixi
  - Nima sotib olgani
  - Qarzlari
  - Mahsulotlar ro'yxati
  - Barcha ma'lumotlar bir joyda ko'rinsin

---

## 11. Telefon Raqam — Barcha Modullarda Raqam Kiritilsin
- Ba'zi modullarda telefon so'ralganda matn kiritish qabul qilinmoqda
- **Barcha modul va oynalarda** telefon maydoni faqat **raqam** qabul qilsin
- Harflar va belgilar kiritib bo'lmasin

---

## 12. Mahsulot Sotib Olishda Ta'minotchi Tanlash
- Hozir mahsulot olishda ta'minotchi tanlanmayapti yoki majburiy
- Ta'minotchidan olish imkoni bo'lsin, lekin **majburiy emas**
- Ixtiyoriy tanlash imkoni qo'shilsin

---

## 13. Ta'minotchilar Bo'limi — To'liq Profil Oynasi Yo'q
- Ta'minotchi ustiga bosilganda to'liq ma'lumot ochilmaydi
- **Yangi to'liq oyna** ochilishi kerak:
  - Barcha kirim tarixi
  - Chiqim tarixi
  - Yetkazib bergan mahsulotlar
  - To'liq moliyaviy tarix

---

## 14. Xaridlar Bo'limi — O'chirilsin
- Alohida "Xaridlar" bo'limi kerak emas
- Xaridlar bo'limidagi **barcha funksiyalar** → Ta'minotchilar sahifasiga ko'chirilsin

---

## 15. Kassir Roli — Keraksiz Bo'limlar
- Kassir uchun **Bosh sahifa** ko'rinmasin
- Kassir uchun **Tovarlar bo'limi** ko'rinmasin
- Kassirga faqat kerakli modullar (masalan: Sotuv, Nasiya) ko'rinsin

---

## Xulosa

| # | Muammo | Muhimlik |
|---|--------|----------|
| 1 | Rasmlar bir xil o'lchamda emas | Yuqori |
| 2 | Barkod uzun (6 ta bo'lishi kerak) | O'rta |
| 3 | Barkod qo'lda yozilmoqda | Yuqori |
| 4 | Checkbox va nom bir qatorda emas | O'rta |
| 5 | Ommaviy kirim avtomatik qo'shib yubormoqda | Yuqori |
| 6 | Ommaviy kirimda skaner yo'q | Yuqori |
| 7 | Emoji o'rniga icon yo'q | Past |
| 8 | Nasiyada mijoz yozilmoqda, tanlanmaydi | Yuqori |
| 9 | Nasiyada keraksiz telefon maydoni | O'rta |
| 10 | Mijoz profili to'liq ochilmaydi | Yuqori |
| 11 | Telefon maydoni raqam qabul qilmaydi | O'rta |
| 12 | Ta'minotchi ixtiyoriy tanlanmaydi | O'rta |
| 13 | Ta'minotchi profili to'liq ochilmaydi | Yuqori |
| 14 | Xaridlar bo'limi alohida turishi kerak emas | O'rta |
| 15 | Kassirda ortiqcha bo'limlar ko'rinmoqda | O'rta |
