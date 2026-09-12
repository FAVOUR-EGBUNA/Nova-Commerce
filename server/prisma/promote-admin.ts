import "dotenv/config";
import prisma from "../src/config/prisma.js";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx prisma/promote-admin.ts your@email.com");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: {
      email: email.toLowerCase(),
    },
    data: {
      role: "ADMIN",
    },
    select: {
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Admin account ready:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
