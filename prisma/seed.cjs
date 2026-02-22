/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "demo@launchos.dev";
  const password = "demo1234";

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo user already exists.");
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash
    }
  });

  const ws = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      memberships: {
        create: {
          userId: user.id,
          role: "OWNER"
        }
      },
      plan: {
        create: { tier: "SOLO", status: "active" }
      }
    }
  });

  await prisma.project.create({
    data: {
      workspaceId: ws.id,
      name: "NotaryFlow (Demo)",
      nicheKeywords: "mobile notary, notary signing agent, travel fee, scheduling, mileage, invoicing",
      icpGuess: "Solo mobile notaries and loan signing agents doing 10–40 appointments/week",
      competitorUrls: "https://example.com"
    }
  });

  console.log("Seed complete. Demo user:", email, password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
