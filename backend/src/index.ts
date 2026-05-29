import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registrationRoutes from './routes/registrations';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/registrations', registrationRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'CapBay Auto API is running' });
});

export default app;