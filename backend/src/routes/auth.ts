import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { signupSchema, loginSchema } from '../types/schemas';
import { successResponse, createdResponse } from '../utils/response';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post(
    '/signup',
    validateBody(signupSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.signup(req.body);
            createdResponse(res, {
                message: 'User registered successfully',
                user: result.user,
                session: result.session,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
    '/login',
    validateBody(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.login(req.body);
            successResponse(res, {
                message: 'Login successful',
                user: result.user,
                session: result.session,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
    '/logout',
    authenticateUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '') || '';
            await authService.logout(token);
            successResponse(res, { message: 'Logout successful' });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
    '/me',
    authenticateUser,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const profile = await authService.getUserProfile(req.user.id);
            successResponse(res, { profile });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
    '/refresh',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                return res.status(400).json({ error: 'Refresh token is required' });
            }

            const result = await authService.refreshToken(refresh_token);
            successResponse(res, {
                message: 'Token refreshed successfully',
                session: result.session,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
