// Test user yaratish
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Test user yaratish...\n');

  try {
    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: { email: 'admin' },
    });

    if (existing) {
      console.log('✅ User allaqachon mavjud!');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   Role: ${existing.role}\n`);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('✅ Test user yaratildi!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: admin`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}\n`);

    console.log('🎉 Endi login qilishingiz mumkin!');
    console.log('   http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
