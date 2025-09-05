import { Request, Response } from 'express';
import OrderModel from '../models/order.model';
import { ORDER_STATUS } from '../utils/constants';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const allOrders = await OrderModel.find({})
            .populate('buyer', 'firstName lastName email')
            .populate('products.product', 'name imageUrl price')
            .skip(skip)
            .limit(limit)
            .sort({ orderDate: -1 });

        const totalOrders = await OrderModel.countDocuments({});

        res.status(200).json({
            orders: allOrders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders,
                hasNextPage: page < Math.ceil(totalOrders / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch orders'
        });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderModel.findById(req.params.id)
            .populate('buyer', 'firstName lastName email phoneNumber')
            .populate('products.product', 'name imageUrl price color sizes');

        if (!order) {
            res.status(404).json({
                status: 'failed',
                error: 'Order not found'
            });
            return;
        }

        res.status(200).json({
            order
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch order'
        });
    }
};

export const getOrdersByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await OrderModel.find({ buyer: req.params.id })
            .populate('products.product', 'name imageUrl price')
            .sort({ orderDate: -1 });

        res.status(200).json({
            orders,
            count: orders.length
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch user orders'
        });
    }
};

export const getOrdersByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;
        
        const validStatuses = Object.values(ORDER_STATUS);
        if (!validStatuses.includes(status as any)) {
            res.status(400).json({
                status: 'failed',
                error: `Invalid order status. Valid statuses: ${validStatuses.join(', ')}`
            });
            return;
        }

        const orders = await OrderModel.find({ orderStatus: status })
            .populate('buyer', 'firstName lastName email')
            .populate('products.product', 'name imageUrl price')
            .sort({ orderDate: -1 });

        res.status(200).json({
            orders,
            count: orders.length,
            status: status
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch orders by status'
        });
    }
};

export const addOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { products, address, notes } = req.body;
        const buyerId = req.user?.id; // Assuming user is attached via auth middleware

        if (!products || !Array.isArray(products) || products.length === 0) {
            res.status(400).json({
                status: 'failed',
                error: 'Products array is required and must not be empty'
            });
            return;
        }

        if (!address || address.trim().length < 10) {
            res.status(400).json({
                status: 'failed',
                error: 'Valid address is required (minimum 10 characters)'
            });
            return;
        }

        const orderData = {
            products,
            buyer: buyerId,
            address: address.trim(),
            notes: notes?.trim() || undefined
        };

        const newOrder = await OrderModel.create(orderData);
        await newOrder.populate('buyer', 'firstName lastName email');
        await newOrder.populate('products.product', 'name imageUrl price');

        res.status(201).json({
            status: 'success',
            order: newOrder
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to create order'
        });
    }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderStatus, deliveryDate, trackingNumber, notes } = req.body;

        const updateData: any = {};
        
        if (orderStatus) {
            const validStatuses = Object.values(ORDER_STATUS);
            if (!validStatuses.includes(orderStatus)) {
                res.status(400).json({
                    status: 'failed',
                    error: `Invalid order status. Valid statuses: ${validStatuses.join(', ')}`
                });
                return;
            }
            updateData.orderStatus = orderStatus;
        }

        if (deliveryDate) updateData.deliveryDate = deliveryDate;
        if (trackingNumber) updateData.trackingNumber = trackingNumber.trim().toUpperCase();
        if (notes !== undefined) updateData.notes = notes?.trim() || undefined;

        const order = await OrderModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('buyer', 'firstName lastName email')
        .populate('products.product', 'name imageUrl price');

        if (!order) {
            res.status(404).json({
                status: 'failed',
                error: 'Order not found'
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            order
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to update order'
        });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderModel.findById(req.params.id);

        if (!order) {
            res.status(404).json({
                status: 'failed',
                error: 'Order not found'
            });
            return;
        }

        if (order.orderStatus !== ORDER_STATUS.Pending && order.orderStatus !== ORDER_STATUS.Processing) {
            res.status(400).json({
                status: 'failed',
                error: 'Order cannot be cancelled. It may have already been shipped or delivered.'
            });
            return;
        }

        await OrderModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'Order deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to delete order'
        });
    }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await OrderModel.findById(req.params.id);

        if (!order) {
            res.status(404).json({
                status: 'failed',
                error: 'Order not found'
            });
            return;
        }

        if (order.orderStatus !== ORDER_STATUS.Pending && order.orderStatus !== ORDER_STATUS.Processing) {
            res.status(400).json({
                status: 'failed',
                error: 'Order cannot be cancelled. It may have already been shipped or delivered.'
            });
            return;
        }

        order.orderStatus = ORDER_STATUS.Cancelled;
        await order.save();

        await order.populate('buyer', 'firstName lastName email');
        await order.populate('products.product', 'name imageUrl price');

        res.status(200).json({
            status: 'success',
            order
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to cancel order'
        });
    }
};
