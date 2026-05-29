# CapBay Auto — Test Drive Registration System

A web-based system for CapBay Auto Sdn. Bhd. to manage test drive registrations for the CapBay Vroom (RM 200,000). Customers can register for a test drive, and sales agents can manage registrations, track promotion eligibility, and update purchase status.

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Frontend:** React (Vite), TypeScript
- **Testing:** Jest

---

## How to Run

### Prerequisites

- Node.js v18+
- A PostgreSQL database:
  - Sign up free at [neon.tech](https://neon.tech) (no installation needed)

### 1. Clone the repository

```bash
git clone https://github.com/camilytang/capbay-assessment.git
cd capbay-assessment
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder (use `.env.example` as reference):

```env
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require&channel_binding=require"
PORT=3000
```

Replace the `DATABASE_URL` with your Neon connection string from your Neon project dashboard.

Run database migrations:

```bash
npx prisma migrate dev
```

Seed the database with 50,000 test records:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Run Tests

```bash
cd backend
npm test
```

---

## Assumptions

- **Customer-facing portal:** Customers only register via the form. There is no customer login or status tracking portal — the sales agent contacts them after registration to schedule the test drive.
- **Phone number format:** Users enter their number starting with 0 (e.g. `0123456789`). The system automatically formats it to Malaysian international format (+60) on save. Validation checks for a minimum of 10 digits.
- **IC number format:** Stored as `YYMMDD-PB-####` (e.g. `940629-19-1234`). Users enter 12 digits without dashes and the system formats it automatically.
- **Down payment timing:** Down payment is updated by the sales agent after the customer's loan is approved. It defaults to RM 0.00 at registration.

---

## Money Data Type

All monetary amounts use `Decimal(15, 2)` in PostgreSQL via Prisma, and the `Decimal` class from `@prisma/client/runtime/library` in TypeScript.

Floating point types like `float` or `double` cannot represent decimal fractions exactly in binary — for example `0.1 + 0.2 = 0.30000000000000004` in JavaScript. For financial data this is unacceptable. `Decimal` stores numbers with exact precision, preventing rounding errors across calculations like loan amounts and down payment percentages.

---

## Customer B / Customer C — Promotion Eligibility

**The question:** If Customer B (2nd to register) does not fulfill the down payment requirement, does Customer C (11th to register) become eligible for the promotion?

**Decision: Yes, Customer C becomes eligible.**

**Reasoning:** The promotion requires two conditions — registered for a test drive AND paid at least 10% down payment (RM 20,000). A customer who has not paid the minimum has not fulfilled their side of the promotion conditions. Counting them toward the 10 available slots would be unfair to customers who have genuinely committed.

Therefore, the system counts only registrations that are:

1. Not cancelled
2. Have paid at least 10% down payment (RM 20,000)

If Customer B only paid 5% down payment, they do not occupy one of the 10 promotion slots. Customer C, being the 10th qualifying customer, becomes eligible.

This same logic handles cancellations. A cancelled registration is also excluded from the position count, naturally freeing up a slot for the next qualifying customer.

---

## AI Tool Usage

Claude (claude.ai) was used throughout this project as a coding assistant for scaffolding, debugging, and code review.

**Example of AI output that had to be corrected:**

The initial setup placed `dotenv.config()` in `src/index.ts` to load environment variables. The server kept returning 401 Unauthorized errors and the terminal showed `injected env (0)` meaning zero variables were loaded.

Claude initially diagnosed this incorrectly. After further investigation, the root cause was identified: TypeScript `import` statements compile to CommonJS `require()` calls which are hoisted and executed before any other code. This meant Prisma's `new PrismaClient()` was called before `dotenv.config()` had a chance to load `DATABASE_URL`, causing Prisma to connect with no credentials.

The fix was to move `dotenv.config()` into `src/lib/prisma.ts`, ensuring it runs before `new PrismaClient()` is instantiated. This is a subtle Node.js module loading behaviour that Claude's initial suggestion missed.
