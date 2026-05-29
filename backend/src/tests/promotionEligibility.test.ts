import { Decimal } from '@prisma/client/runtime/library';
import { CAR_PRICE, DISCOUNT_RATE, MIN_DOWN_PAYMENT_RATE, PROMOTION_LIMIT } from '../lib/constants';

// Pure function we can test without database
const checkEligibility = (position: number, downPayment: Decimal): boolean => {
    const minDownPayment = CAR_PRICE.mul(MIN_DOWN_PAYMENT_RATE);
    const hasEnoughDownPayment = downPayment.gte(minDownPayment);
    return position <= PROMOTION_LIMIT && hasEnoughDownPayment;
};

const calculateLoanAmount = (downPayment: Decimal, isEligible: boolean): Decimal => {
    const discountedPrice = isEligible
        ? CAR_PRICE.mul(new Decimal('1').minus(DISCOUNT_RATE))
        : CAR_PRICE;
    return discountedPrice.minus(downPayment);
};

describe('Promotion Eligibility', () => {
    test('Customer A - 1st to register with 20% down payment should be eligible', () => {
        const downPayment = CAR_PRICE.mul(new Decimal('0.20')); // RM 40,000
        const result = checkEligibility(1, downPayment);
        expect(result).toBe(true);
    });

    test('Customer B - 2nd to register but decides not to buy should not be eligible', () => {
        const downPayment = new Decimal('0'); // no down payment
        const result = checkEligibility(2, downPayment);
        expect(result).toBe(false);
    });

    test('Customer C - 11th to register with 10% down payment should not be eligible', () => {
        const downPayment = CAR_PRICE.mul(new Decimal('0.10')); // RM 20,000
        const result = checkEligibility(11, downPayment);
        expect(result).toBe(false);
    });

    test('Customer in top 10 with exactly 10% down payment should be eligible', () => {
        const downPayment = CAR_PRICE.mul(new Decimal('0.10')); // RM 20,000
        const result = checkEligibility(10, downPayment);
        expect(result).toBe(true);
    });

    test('Customer in top 10 with less than 10% down payment should not be eligible', () => {
        const downPayment = CAR_PRICE.mul(new Decimal('0.05')); // RM 10,000
        const result = checkEligibility(5, downPayment);
        expect(result).toBe(false);
    });
});

describe('Loan Amount Calculation', () => {
    test('Eligible customer should get 15% discount on loan amount', () => {
        const downPayment = new Decimal('40000'); // RM 40,000
        const loanAmount = calculateLoanAmount(downPayment, true);
        // 200,000 * 0.85 - 40,000 = 130,000
        expect(loanAmount.toFixed(2)).toBe('130000.00');
    });

    test('Non-eligible customer should get no discount', () => {
        const downPayment = new Decimal('40000'); // RM 40,000
        const loanAmount = calculateLoanAmount(downPayment, false);
        // 200,000 - 40,000 = 160,000
        expect(loanAmount.toFixed(2)).toBe('160000.00');
    });
});