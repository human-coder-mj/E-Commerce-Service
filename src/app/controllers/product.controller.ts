import { Request, Response } from 'express';
import ProductModel from '../models/product.model';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const allProducts = await ProductModel.find({ status: true })
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalProducts = await ProductModel.countDocuments({ status: true });

        res.status(200).json({
            products: allProducts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                hasNextPage: page < Math.ceil(totalProducts / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch products'
        });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductModel.findById(req.params.id).populate('category', 'name');

        if (!product) {
            res.status(404).json({
                status: 'failed',
                error: 'Product not found'
            });
            return;
        }

        res.status(200).json({
            product
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch product'
        });
    }
};

export const getProductsByColor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { color } = req.params;
        const minPrice = parseFloat(req.query.minPrice as string) || 0;
        const maxPrice = parseFloat(req.query.maxPrice as string) || Number.MAX_VALUE;

        const products = await ProductModel.find({
            $and: [
                { price: { $gte: minPrice } },
                { price: { $lte: maxPrice } },
                { color: { $regex: color, $options: 'i' } },
                { status: true }
            ]
        }).populate('category', 'name');

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch products by color'
        });
    }
};

export const getProductsByCategoryId = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await ProductModel.find({ 
            category: req.params.id,
            status: true 
        }).populate('category', 'name');

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch products by category'
        });
    }
};

export const getProductsByGender = async (req: Request, res: Response): Promise<void> => {
    try {
        const { gender } = req.params;
        const minPrice = parseFloat(req.query.minPrice as string) || 0;
        const maxPrice = parseFloat(req.query.maxPrice as string) || Number.MAX_VALUE;

        const products = await ProductModel.find({
            $and: [
                { price: { $gte: minPrice } },
                { price: { $lte: maxPrice } },
                { gender: { $regex: gender, $options: 'i' } },
                { status: true }
            ]
        }).populate('category', 'name');

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch products by gender'
        });
    }
};

export const getProductsByPrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const minPrice = parseFloat(req.query.minPrice as string) || 0;
        const maxPrice = parseFloat(req.query.maxPrice as string) || Number.MAX_VALUE;

        if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
            res.status(400).json({
                status: 'failed',
                error: 'Invalid price range'
            });
            return;
        }

        const products = await ProductModel.find({
            $and: [
                { price: { $gte: minPrice } },
                { price: { $lte: maxPrice } },
                { status: true }
            ]
        }).populate('category', 'name');

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch products by price'
        });
    }
};

export const getProductsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;
        const isActive = status.toLowerCase() === 'true';

        const products = await ProductModel.find({ status: isActive }).populate('category', 'name');

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch products by status'
        });
    }
};

export const getProductsBySearch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.params;

        if (!search || search.trim().length < 2) {
            res.status(400).json({
                status: 'failed',
                error: 'Search term must be at least 2 characters long'
            });
            return;
        }

        const products = await ProductModel.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                },
                { status: true }
            ]
        }).populate('category', 'name');

        res.status(200).json({
            products,
            count: products.length,
            searchTerm: search
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to search products'
        });
    }
};

export const getProductsByQueries = async (req: Request, res: Response): Promise<void> => {
    try {
        const minPrice = parseFloat(req.query.minPrice as string) || 0;
        const maxPrice = parseFloat(req.query.maxPrice as string) || Number.MAX_VALUE;
        const color = req.query.color as string;
        const gender = req.query.gender as string;

        const queryConditions: any[] = [
            { price: { $gte: minPrice } },
            { price: { $lte: maxPrice } },
            { status: true }
        ];

        if (color) {
            queryConditions.push({ color: { $regex: color, $options: 'i' } });
        }

        if (gender) {
            queryConditions.push({ gender: { $regex: gender, $options: 'i' } });
        }

        const products = await ProductModel.find({
            $and: queryConditions
        }).populate('category', 'name');

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch products with queries'
        });
    }
};

export const addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, color, sizes, description, price, gender, imageUrl } = req.body;

        if (!name || !color || !sizes || !description || !price || !gender || !imageUrl) {
            res.status(400).json({
                status: 'failed',
                error: 'All required fields must be provided'
            });
            return;
        }

        const newProduct = await ProductModel.create(req.body);
        await newProduct.populate('category', 'name');

        res.status(201).json({
            status: 'success',
            product: newProduct
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to create product'
        });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!product) {
            res.status(404).json({
                status: 'failed',
                error: 'Product not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            product
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to update product'
        });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id);

        if (!product) {
            res.status(404).json({
                status: 'failed',
                error: 'Product not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to delete product'
        });
    }
};
