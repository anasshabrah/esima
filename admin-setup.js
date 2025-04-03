// admin-setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAdmin() {
  // Replace with the email of the user you want to make admin
  const userEmail = 'h.anos@hotmail.com';
  
  const updatedUser = await prisma.user.update({
    where: { email: userEmail },
    data: { isAdmin: true },
  });
  
  console.log(`User ${updatedUser.email} is now an admin`);
}

setupAdmin()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
