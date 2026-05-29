import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../lib/prisma';
import { CAR_PRICE, DISCOUNT_RATE, MIN_DOWN_PAYMENT_RATE, PROMOTION_LIMIT } from '../lib/constants';

export const checkPromotionEligibility = async (registrationId: number): Promise<boolean> => {
    const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
    });

    if (!registration) return false;

    const minDownPayment = CAR_PRICE.mul(MIN_DOWN_PAYMENT_RATE);

    // Check if this customer paid enough down payment
    const hasEnoughDownPayment = registration.downPayment.gte(minDownPayment);
    if (!hasEnoughDownPayment) return false;

    // Count how many non-cancelled registrations with sufficient down payment are ahead of or equal to this one
    const position = await prisma.registration.count({
        where: {
            id: { lte: registrationId },
            status: { not: 'CANCELLED' },
            downPayment: { gte: minDownPayment },
        },
    });

    return position <= PROMOTION_LIMIT;
};

export const calculateLoanAmount = (downPayment: Decimal, isEligible: boolean): Decimal => {
    const discountedPrice = isEligible
        ? CAR_PRICE.mul(new Decimal('1').minus(DISCOUNT_RATE))
        : CAR_PRICE;

    const loan = discountedPrice.minus(downPayment);
    return loan.isNegative() ? new Decimal('0') : loan;
};