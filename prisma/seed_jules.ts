import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Jules...");

    const jules = await prisma.agent.upsert({
        where: { id: "jules-gh-executor" }, // Use a fixed ID for easy reference
        update: {},
        create: {
            id: "jules-gh-executor",
            name: "Jules",
            type: "executor",
            description: "GitHub-based Heavy Lifter (Async Executor)",
            enabled: true,
            keyCapabilities: JSON.stringify(["Refactoring", "Testing", "Bulk Edits"]),
            recommendedUses: "Assign heavy coding tasks that require focus and time.",
            config: JSON.stringify({
                github_repo: "morodas-ai/morodas-os",
                review_required: true,
            }),
        },
    });

    console.log({ jules });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
