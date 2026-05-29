import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { checkPromotionEligibility, calculateLoanAmount } from '../services/registrationService';
import { Decimal } from '@prisma/client/runtime/library';

const router = Router();

const VALID_TRANSITIONS: Record<string, string[]> = {
    REGISTERED: ['TEST_DRIVE_SCHEDULED', 'CANCELLED'],
    TEST_DRIVE_SCHEDULED: ['TEST_DRIVE_COMPLETED', 'CANCELLED'],
    TEST_DRIVE_COMPLETED: ['PURCHASED', 'CANCELLED'],
    PURCHASED: [],
    CANCELLED: [],
};

// POST /api/registrations - Register a new customer
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, icNumber } = req.body;

        if (!name || !email || !phone || !icNumber) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const registration = await prisma.registration.create({
            data: { name, email, phone, icNumber },
        });

        res.status(201).json(registration);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Email or IC number already registered' });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/registrations - Get all registrations
router.get('/', async (req: Request, res: Response) => {
    try {
        const rawPage = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
        const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
        const rawSearch = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;

        const page = parseInt(rawPage as string, 10) || 1;
        const limit = parseInt(rawLimit as string, 10) || 20;
        const search = (rawSearch as string) || '';
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { icNumber: { contains: search, mode: 'insensitive' as const } },
            ],
        } : {};

        const [registrations, total] = await Promise.all([
            prisma.registration.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
            }),
            prisma.registration.count({ where }),
        ]);

        res.json({
            data: registrations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/registrations/:id - Get a single registration
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const registration = await prisma.registration.findUnique({ where: { id } });

        if (!registration) {
            res.status(404).json({ error: 'Registration not found' });
            return;
        }

        const isPromotionEligible = await checkPromotionEligibility(id);
        const loanAmount = calculateLoanAmount(registration.downPayment, isPromotionEligible);

        res.json({ ...registration, isPromotionEligible, loanAmount });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT = replace whole record, PATCH = update only some fields
// PATCH /api/registrations/:id - Update a registration
// update status and downpayment only
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const { status, downPayment } = req.body;

        const existing = await prisma.registration.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Registration not found' });
            return;
        }

        // Validate state transition
        if (status && status !== existing.status) {
            const allowed = VALID_TRANSITIONS[existing.status] || [];
            if (!allowed.includes(status)) {
                res.status(400).json({
                    error: `Invalid transition from ${existing.status} to ${status}`,
                });
                return;
            }
        }

        const updated = await prisma.registration.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(downPayment !== undefined && { downPayment: new Decimal(downPayment) }),
            },
        });

        const isPromotionEligible = await checkPromotionEligibility(id);
        const loanAmount = calculateLoanAmount(updated.downPayment, isPromotionEligible);

        res.json({ ...updated, isPromotionEligible, loanAmount });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;