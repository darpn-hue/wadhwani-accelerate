import { Router, Request, Response, NextFunction } from 'express';
import * as ventureService from '../services/ventureService';
import { authenticateUser } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
    createVentureSchema,
    updateVentureSchema,
    createStreamSchema,
    updateStreamSchema,
    ventureQuerySchema
} from '../types/schemas';
import { successResponse, createdResponse, noContentResponse } from '../utils/response';

const router = Router();

// ============ VENTURE ROUTES ============

/**
 * GET /api/ventures
 * Get all ventures (with filters)
 */
router.get(
    '/',
    authenticateUser,
    validateQuery(ventureQuerySchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { data: profile } = await require('../config/supabase').supabase
                .from('profiles')
                .select('role')
                .eq('id', req.user.id)
                .single();

            const result = await ventureService.getVentures(
                req.user.id,
                profile?.role || 'entrepreneur',
                req.query as any
            );

            successResponse(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/ventures
 * Create a new venture
 */
router.post(
    '/',
    authenticateUser,
    validateBody(createVentureSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const venture = await ventureService.createVenture(req.user.id, req.body);
            createdResponse(res, { venture });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/ventures/:id
 * Get a single venture by ID
 */
router.get(
    '/:id',
    authenticateUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { data: profile } = await require('../config/supabase').supabase
                .from('profiles')
                .select('role')
                .eq('id', req.user.id)
                .single();

            const result = await ventureService.getVentureById(
                req.params.id,
                req.user.id,
                profile?.role || 'entrepreneur'
            );

            successResponse(res, result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PUT /api/ventures/:id
 * Update a venture
 */
router.put(
    '/:id',
    authenticateUser,
    validateBody(updateVentureSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { data: profile } = await require('../config/supabase').supabase
                .from('profiles')
                .select('role')
                .eq('id', req.user.id)
                .single();

            const venture = await ventureService.updateVenture(
                req.params.id,
                req.user.id,
                profile?.role || 'entrepreneur',
                req.body
            );

            successResponse(res, { venture });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/ventures/:id
 * Delete a venture
 */
router.delete(
    '/:id',
    authenticateUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { data: profile } = await require('../config/supabase').supabase
                .from('profiles')
                .select('role')
                .eq('id', req.user.id)
                .single();

            await ventureService.deleteVenture(
                req.params.id,
                req.user.id,
                profile?.role || 'entrepreneur'
            );

            noContentResponse(res);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/ventures/:id/submit
 * Submit a venture for review
 */
router.post(
    '/:id/submit',
    authenticateUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const venture = await ventureService.submitVenture(req.params.id, req.user.id);
            successResponse(res, {
                message: 'Venture submitted for review',
                venture
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============ STREAM ROUTES ============

/**
 * GET /api/ventures/:id/streams
 * Get all streams for a venture
 */
router.get(
    '/:id/streams',
    authenticateUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const streams = await ventureService.getVentureStreams(req.params.id);
            successResponse(res, { streams });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/ventures/:id/streams
 * Create a new stream for a venture
 */
router.post(
    '/:id/streams',
    authenticateUser,
    validateBody(createStreamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stream = await ventureService.createStream(req.params.id, req.body);
            createdResponse(res, { stream });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PUT /api/streams/:id
 * Update a stream
 */
router.put(
    '/streams/:id',
    authenticateUser,
    validateBody(updateStreamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stream = await ventureService.updateStream(req.params.id, req.body);
            successResponse(res, { stream });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/streams/:id
 * Delete a stream
 */
router.delete(
    '/streams/:id',
    authenticateUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await ventureService.deleteStream(req.params.id);
            noContentResponse(res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
