import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Wadhwani Ventures API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
});

export default router;
