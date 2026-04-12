import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import connectDB from '../lib/mongoose';
import User from '../models/User';
import Product from '../models/Product';
import bcrypt from 'bcryptjs';

async function seed() {
  await connectDB();

  // ── Foydalanuvchilar ──────────────────────────────────────
  const users = [
    { name: 'Abdullo', login: 'admin', password: 'admin123', role: 'admin' },
    { name: 'Kassir', login: 'kassir', password: 'kassir123', role: 'kassir' },
    { name: 'Yordamchi', login: 'yordam', password: 'yordam123', role: 'yordamchi' },
  ];

  for (const u of users) {
    const exists = await User.findOne({ login: u.login });
    if (!exists) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashed });
      console.log(`✓ Foydalanuvchi yaratildi: ${u.login} / ${u.password}`);
    } else {
      console.log(`— Mavjud (foydalanuvchi): ${u.login}`);
    }
  }

  // ── Mahsulotlar ───────────────────────────────────────────
  const products = [
    {
      name: 'Asus VivoBook 15 X1500EA',
      category: 'Noutbuk',
      buyPrice: 4_500_000,
      sellPrice: 5_200_000,
      quantity: 15,
      barcode: '4710483694065',
      description: 'Intel Core i3-1115G4, 8GB RAM, 256GB SSD, 15.6" FHD',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80&fit=crop',
    },
    {
      name: 'HP 15s-fq5000',
      category: 'Noutbuk',
      buyPrice: 3_800_000,
      sellPrice: 4_400_000,
      quantity: 8,
      barcode: '0197029463608',
      description: 'Intel Core i3-1215U, 8GB RAM, 512GB SSD, 15.6" FHD',
      image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80&fit=crop',
    },
    {
      name: 'Lenovo IdeaPad 3 15ALC6',
      category: 'Noutbuk',
      buyPrice: 5_200_000,
      sellPrice: 5_900_000,
      quantity: 6,
      barcode: '0196119785604',
      description: 'AMD Ryzen 5 5500U, 8GB RAM, 512GB SSD, 15.6" FHD',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80&fit=crop',
    },
    {
      name: 'Acer Aspire 5 A515-56',
      category: 'Noutbuk',
      buyPrice: 4_800_000,
      sellPrice: 5_500_000,
      quantity: 10,
      barcode: '4710180924068',
      description: 'Intel Core i5-1135G7, 8GB RAM, 512GB SSD, 15.6" FHD',
      image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80&fit=crop',
    },
    {
      name: 'Dell Inspiron 15 3511',
      category: 'Noutbuk',
      buyPrice: 5_500_000,
      sellPrice: 6_200_000,
      quantity: 4,
      barcode: '0884116378754',
      description: 'Intel Core i5-1135G7, 8GB RAM, 256GB SSD, 15.6" FHD',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80&fit=crop',
    },
    {
      name: 'Apple MacBook Air M2 13"',
      category: 'Noutbuk',
      buyPrice: 12_000_000,
      sellPrice: 14_500_000,
      quantity: 3,
      barcode: '0194253375357',
      description: 'Apple M2 chip, 8GB RAM, 256GB SSD, 13.6" Liquid Retina',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80&fit=crop',
    },
    {
      name: 'Logitech MX Keys Wireless',
      category: 'Aksessuar',
      buyPrice: 350_000,
      sellPrice: 450_000,
      quantity: 20,
      barcode: '5099206086425',
      description: 'Simsiz klaviatura, backlight, multi-device',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80&fit=crop',
    },
    {
      name: 'HP USB Optical Mouse',
      category: 'Aksessuar',
      buyPrice: 55_000,
      sellPrice: 80_000,
      quantity: 35,
      barcode: '0889894526083',
      description: '1200 DPI, USB, ergonomic design',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80&fit=crop',
    },
    {
      name: 'TP-Link USB Wi-Fi Adapter TL-WN823N',
      category: 'Aksessuar',
      buyPrice: 80_000,
      sellPrice: 120_000,
      quantity: 25,
      barcode: '6935364051396',
      description: '300Mbps, USB 2.0, Mini size',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&fit=crop',
    },
    {
      name: 'SanDisk 256GB USB 3.0 Flash Drive',
      category: 'Aksessuar',
      buyPrice: 95_000,
      sellPrice: 140_000,
      quantity: 30,
      barcode: '0619659182458',
      description: "Ultra USB 3.0, 130MB/s o'qish tezligi",
      image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=400&q=80&fit=crop',
    },
  ];

  for (const p of products) {
    await Product.findOneAndUpdate(
      { name: p.name },
      { $set: { ...p, status: 'active' } },
      { upsert: true, new: true }
    );
    console.log(`✓ Mahsulot yangilandi: ${p.name}`);
  }

  console.log('\nSeed tugadi!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
