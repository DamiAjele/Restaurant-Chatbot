import dotenv from "dotenv";
import { Pool } from "pg"; // <-- 1. Import Pool from the pg package
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Load environment variables first
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

// 2. Initialize a pg Pool using your connection string
const pool = new Pool({ connectionString });

// 3. Pass the pool into the PrismaPg adapter
const adapter = new PrismaPg(pool);

// 4. Pass the adapter into the PrismaClient
const prisma = new PrismaClient({ adapter });

export default prisma;
export { prisma };
