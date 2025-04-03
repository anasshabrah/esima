// admin-setup.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'h.anos@hotmail.com';
  const name = 'Anass Habrah';
  const password = '511511511';

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert the admin record: update it if it exists, or create a new one if it doesn't
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      // Optionally update other fields if needed.
    },
    create: {
      email,
      name,
      password: hashedPassword,
    },
  });

  console.log('Admin upserted successfully:', admin);
}

main()
  .catch((e) => {
    console.error('Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
