const VALID_TRANSITIONS: Record<string, string[]> = {
    REGISTERED: ['TEST_DRIVE_SCHEDULED', 'CANCELLED'],
    TEST_DRIVE_SCHEDULED: ['TEST_DRIVE_COMPLETED', 'CANCELLED'],
    TEST_DRIVE_COMPLETED: ['PURCHASED', 'CANCELLED'],
    PURCHASED: [],
    CANCELLED: [],
};

const isValidTransition = (from: string, to: string): boolean => {
    const allowed = VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
};

describe('State Transitions', () => {
    test('REGISTERED can move to TEST_DRIVE_SCHEDULED', () => {
        expect(isValidTransition('REGISTERED', 'TEST_DRIVE_SCHEDULED')).toBe(true);
    });

    test('REGISTERED can be CANCELLED', () => {
        expect(isValidTransition('REGISTERED', 'CANCELLED')).toBe(true);
    });

    test('REGISTERED cannot skip to PURCHASED', () => {
        expect(isValidTransition('REGISTERED', 'PURCHASED')).toBe(false);
    });

    test('REGISTERED cannot skip to TEST_DRIVE_COMPLETED', () => {
        expect(isValidTransition('REGISTERED', 'TEST_DRIVE_COMPLETED')).toBe(false);
    });

    test('TEST_DRIVE_COMPLETED can move to PURCHASED', () => {
        expect(isValidTransition('TEST_DRIVE_COMPLETED', 'PURCHASED')).toBe(true);
    });

    test('PURCHASED cannot transition to anything', () => {
        expect(isValidTransition('PURCHASED', 'CANCELLED')).toBe(false);
    });

    test('CANCELLED cannot transition to anything', () => {
        expect(isValidTransition('CANCELLED', 'REGISTERED')).toBe(false);
    });
});