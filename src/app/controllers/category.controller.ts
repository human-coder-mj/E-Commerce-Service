import { Request, Response } from 'express';
import Category from '../models/category.model';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const includeInactive = req.query.includeInactive === 'true';

        const filter = includeInactive ? {} : { status: true };

        const allCategories = await Category.find(filter)
            .populate('genre', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        const totalCategories = await Category.countDocuments(filter);

        res.status(200).json({
            categories: allCategories,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCategories / limit),
                totalCategories,
                hasNextPage: page < Math.ceil(totalCategories / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch categories'
        });
    }
};

export const getActiveCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find({ status: true })
            .populate('genre', 'name')
            .sort({ name: 1 });

        res.status(200).json({
            categories,
            count: categories.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch active categories'
        });
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await Category.findById(req.params.id).populate('genre', 'name');

        if (!category) {
            res.status(404).json({
                status: 'failed',
                error: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            category
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch category'
        });
    }
};

export const getCategoryByGenre = async (req: Request, res: Response): Promise<void> => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const filter: any = { genre: req.params.id };
        
        if (!includeInactive) {
            filter.status = true;
        }

        const categories = await Category.find(filter)
            .populate('genre', 'name')
            .sort({ name: 1 });

        res.status(200).json({
            categories,
            count: categories.length,
            genreId: req.params.id
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch categories by genre'
        });
    }
};

export const searchCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.params;

        if (!search || search.trim().length < 2) {
            res.status(400).json({
                status: 'failed',
                error: 'Search term must be at least 2 characters long'
            });
            return;
        }

        const categories = await Category.find({
            $and: [
                { name: { $regex: search, $options: 'i' } },
                { status: true }
            ]
        }).populate('genre', 'name');

        res.status(200).json({
            categories,
            count: categories.length,
            searchTerm: search
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to search categories'
        });
    }
};

export const addCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, genre } = req.body;

        if (!name || name.trim().length < 2) {
            res.status(400).json({
                status: 'failed',
                error: 'Category name is required and must be at least 2 characters long'
            });
            return;
        }

        const existingCategory = await Category.findOne({ 
            name: { $regex: `^${name.trim()}$`, $options: 'i' } 
        });

        if (existingCategory) {
            res.status(409).json({
                status: 'failed',
                error: 'Category with this name already exists'
            });
            return;
        }

        const categoryData = {
            name: name.trim(),
            genre: genre || undefined
        };

        const newCategory = await Category.create(categoryData);
        await newCategory.populate('genre', 'name');

        res.status(201).json({
            status: 'success',
            category: newCategory
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to create category'
        });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, genre, status } = req.body;

        if (name && name.trim().length < 2) {
            res.status(400).json({
                status: 'failed',
                error: 'Category name must be at least 2 characters long'
            });
            return;
        }

        if (name) {
            const existingCategory = await Category.findOne({
                name: { $regex: `^${name.trim()}$`, $options: 'i' },
                _id: { $ne: req.params.id }
            });

            if (existingCategory) {
                res.status(409).json({
                    status: 'failed',
                    error: 'Another category with this name already exists'
                });
                return;
            }
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (genre !== undefined) updateData.genre = genre || null;
        if (status !== undefined) updateData.status = status;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('genre', 'name');

        if (!category) {
            res.status(404).json({
                status: 'failed',
                error: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            category
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to update category'
        });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            res.status(404).json({
                status: 'failed',
                error: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Category deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to delete category'
        });
    }
};

export const toggleCategoryStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404).json({
                status: 'failed',
                error: 'Category not found'
            });
            return;
        }

        category.status = !category.status;
        await category.save();
        await category.populate('genre', 'name');

        res.status(200).json({
            status: 'success',
            category,
            message: `Category ${category.status ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to toggle category status'
        });
    }
};
