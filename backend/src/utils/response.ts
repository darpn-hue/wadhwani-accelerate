import { Response } from 'express';

export function successResponse(res: Response, data: any, statusCode: number = 200) {
    return res.status(statusCode).json(data);
}

export function errorResponse(res: Response, message: string, statusCode: number = 400) {
    return res.status(statusCode).json({ error: message });
}

export function createdResponse(res: Response, data: any) {
    return res.status(201).json(data);
}

export function noContentResponse(res: Response) {
    return res.status(204).send();
}
