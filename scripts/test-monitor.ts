import { checkStagnation } from "../lib/monitor";
import prisma from "../lib/prisma";

async function main() {
    console.log("Running stagnation monitor...");
    const count = await checkStagnation();
    console.log(`Detected ${count} stagnant tasks.`);

    // Verify updates
    const alerts = await prisma.alert.findMany({
        where: { type: "stagnation", isDismissed: false },
    });

    console.log("Active Stagnation Alerts:");
    alerts.forEach(a => {
        console.log(`- [${a.severity}] ${a.title}: ${a.message}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
