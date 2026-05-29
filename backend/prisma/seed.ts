import { PrismaClient, Status } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const CAR_PRICE = new Decimal(200000);

const STATUSES: Status[] = ['REGISTERED', 'TEST_DRIVE_SCHEDULED', 'TEST_DRIVE_COMPLETED', 'PURCHASED', 'CANCELLED'];

async function main() {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.registration.deleteMany(); // wipes existing data so seed is repeatable
    await prisma.$executeRaw`ALTER SEQUENCE registrations_id_seq RESTART WITH 1`;

    // Seed new data
    console.log('Seeding 50000 registrations...');

    // Batch size
    const BATCH_SIZE = 500; // insert 500 at a time instead of one by one
    const TOTAL = 50000;

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const batch = Array.from({ length: BATCH_SIZE }, (_, index) => { // creates an array of 500 items per batch
            const globalIndex = i + index;
            const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
            const downPaymentPercent = Math.random() * 0.9; // random between 0% and 50% of car price
            const downPayment = CAR_PRICE.mul(new Decimal(downPaymentPercent.toFixed(4)));

            return {
                name: faker.person.fullName(), // generates a realistic name
                email: faker.internet.email({ provider: `user${globalIndex}.com` }),
                phone: `+601${faker.string.numeric(8)}`, // generates a Malaysian phone number format
                icNumber: `${faker.date.birthdate({ min: 18, max: 60, mode: 'age' }).toISOString().slice(2, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}-${String(globalIndex + 1).padStart(4, '0')}`,
                status,
                downPayment
            };
        });

        await prisma.registration.createMany({ data: batch });
        console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL)} / ${TOTAL}`);
    }

    console.log('Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());