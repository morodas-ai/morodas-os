import prisma from "../lib/prisma";
import { subDays } from "date-fns";

async function main() {
    console.log("Seeding stagnant task...");
    const threeDaysAgo = subDays(new Date(), 3);

    const task = await prisma.task.create({
        data: {
            title: "Test Stagnant Task",
            description: "This task should trigger a stagnation alert.",
            status: "pending",
            priority: "medium",
            lastActivityAt: threeDaysAgo,
        },
    });

    console.log(`Created task: ${task.id} with lastActivityAt: ${threeDaysAgo.toISOString()}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
