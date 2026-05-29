import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';

const CAR_PRICE = new Decimal('200000');
const DISCOUNT_RATE = new Decimal('0.15');
const MIN_DOWN_PAYMENT_RATE = new Decimal('0.10');
const PROMOTION_LIMIT = 10;

export const checkPromotionEligibility = async (registrationId: number): Promise<boolean> => {
    const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
    });

    if (!registration) return false;

    // Count how many non-cancelled registrations are ahead of this one
    const position = await prisma.registration.count({
        where: {
            id: { lte: registrationId },
            status: { not: 'CANCELLED' },
        },
    });

    const minDownPayment = CAR_PRICE.mul(MIN_DOWN_PAYMENT_RATE);
    const hasEnoughDownPayment = registration.downPayment.gte(minDownPayment);

    return position <= PROMOTION_LIMIT && hasEnoughDownPayment;
};

export const calculateLoanAmount = (downPayment: Decimal): Decimal => {
    const isEligible = downPayment.gte(CAR_PRICE.mul(MIN_DOWN_PAYMENT_RATE));
    const discountedPrice = isEligible
        ? CAR_PRICE.mul(new Decimal('1').minus(DISCOUNT_RATE))
        : CAR_PRICE;

    return discountedPrice.minus(downPayment);
};