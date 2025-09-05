import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';

const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '7d'
    });
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;

        if (!email || !password) {
            res.status(400).json({
                status: 'failed',
                error: 'Email and password are required'
            });
            return;
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                status: 'failed',
                error: 'User with this email already exists'
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = await UserModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber
        });

        const token = generateToken(newUser._id.toString());

        const userResponse = {
            _id: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phoneNumber: newUser.phoneNumber,
            role: newUser.role,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            status: 'success',
            token,
            user: userResponse
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Registration failed'
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                status: 'failed',
                error: 'Email and password are required'
            });
            return;
        }

        const user = await UserModel.findOne({ email }).select('+password');
        
        if (!user) {
            res.status(401).json({
                status: 'failed',
                error: 'Invalid credentials'
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password!);
        
        if (!isPasswordValid) {
            res.status(401).json({
                status: 'failed',
                error: 'Invalid credentials'
            });
            return;
        }

        const token = generateToken(user._id.toString());

        const userResponse = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(200).json({
            status: 'success',
            token,
            user: userResponse
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Login failed'
        });
    }
};
