import { PrismaClient } from "@prisma/client";

let _client: PrismaClient | null = null;

export default function prisma() {
  if (!_client) _client = new PrismaClient();

  return _client;
}

process.on("beforeExist", async () => {
  if (_client) await _client.$disconnect();
});
