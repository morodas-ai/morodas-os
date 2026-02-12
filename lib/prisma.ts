import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        });
    }
    return globalForPrisma.prisma;
}

// Lazy proxy: PrismaClient is only instantiated when a method/property is accessed
const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        const client = getPrismaClient();
        const value = (client as Record<string | symbol, unknown>)[prop];
        if (typeof value === "function") {
            return value.bind(client);
        }
        return value;
    },
});

export default prisma;
