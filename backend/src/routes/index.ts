import { Router } from 'express';
import healthRoutes from './health';
// Import other routes as we create them
// import authRoutes from './auth';
// import ventureRoutes from './ventures';

const router = Router();

// Mount routes
router.use(healthRoutes); // Mount health directly
// router.use('/auth', authRoutes);
// router.use('/ventures', ventureRoutes);

export default router;
