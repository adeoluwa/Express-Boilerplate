import {PrismaClient} from "../../../../generated/prisma"

// let _client: PrismaClient | null = null;

const prisma = new PrismaClient()

// export default function prisma() {
//   if (!_client) _client = new PrismaClient();

//   return _client;
// }

process.on("beforeExit", async () => {
  // if (_client) await _client.$disconnect();
  await prisma.$disconnect();
});

export default prisma;