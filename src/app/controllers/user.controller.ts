import { Request, Response } from 'express';
import UserModel from '../models/user.model';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const allUsers = await UserModel.find({}).select('-password');

        res.status(200).json({
            allUsers
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(req.params.id).select('-password');

        if (!user) {
            res.status(404).json({
                status: 'failed',
                error: 'User not found'
            });
            return;
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({
                status: 'failed',
                error: 'User not found'
            });
            return;
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);

        if (!user) {
            res.status(404).json({
                status: 'failed',
                error: 'User not found'
            });
            return;
        }

        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });
    }
};

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(req.params.id);
        
        if (!user) {
            res.status(404).json({
                status: 'failed',
                error: 'User not found'
            });
            return;
        }

        const favoriteId: string = req.params.favorite;
        const favorites = user.favorites || [];
        
        const isFavorite: boolean = favorites.some(f => f?.toString() === favoriteId);

        if (!isFavorite) {
            favorites.push(favoriteId as any);
            user.favorites = favorites;
            await user.save();

            res.status(200).json({
                favorites: user.favorites
            });
        } else {
            res.status(409).json({
                status: 'failed',
                error: 'This is already your favorite.'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });
    }
};

export const deleteFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(req.params.id);

        if (!user) {
            res.status(404).json({
                status: 'failed',
                error: 'User not found'
            });
            return;
        }

        const favoriteId: string = req.params.favorite;
        const favorites = user.favorites || [];
        
        user.favorites = favorites.filter(f => f?.toString() !== favoriteId);
        await user.save();

        res.status(200).json({
            favorites: user.favorites
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            error
        });
    }
};
