import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const DEFAULT_TAGS = [
  "AI",
  "Productivity",
  "Developer Tools",
  "Design",
  "Marketing",
  "Finance",
  "Education",
  "Analytics",
  "Security",
  "Open Source",
];

const seedTags = async () => {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
      select: { id: true, email: true },
    });

    for (const name of DEFAULT_TAGS) {
      await prisma.tag.upsert({
        where: { name },
        update: {},
        create: {
          name,
          createdById: admin?.id,
        },
      });
    }

    const tags = await prisma.tag.findMany({
      where: { name: { in: DEFAULT_TAGS } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    console.log("Seeded tags:", DEFAULT_TAGS);
    console.table(tags);
    if (admin) {
      console.log("Tags createdBy:", { adminId: admin.id, adminEmail: admin.email });

    } else {
      console.log("No admin found: tags created with createdById = null");

    }
  } catch (error) {
    console.error("Error seeding tags:", error);
    
    process.exitCode = 1;

  } finally {
    await prisma.$disconnect();
  }
};

seedTags();
