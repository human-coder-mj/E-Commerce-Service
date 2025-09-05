import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';

interface AuthRequest extends Request {
    user?: any;
}

interface JwtPayload {
    userId: string;
    iat: number;
    exp: number;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token: string | undefined;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                status: 'failed',
                error: 'Access denied. No token provided.'
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
        
        const user = await UserModel.findById(decoded.userId).select('-password');
        
        if (!user) {
            res.status(401).json({
                status: 'failed',
                error: 'Invalid token. User not found.'
            });
            return;
        }

        req.user = user;
        next();
    } catch (error: any) {
        console.error('Authentication error:', error.message);
        res.status(401).json({
            status: 'failed',
            error: 'Invalid token'
        });
        return;
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                status: 'failed',
                error: 'Access denied. Please login first.'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                status: 'failed',
                error: 'Access denied. Insufficient permissions.'
            });
            return;
        }

        next();
    };
};
