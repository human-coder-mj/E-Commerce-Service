import mongoose, { Document } from 'mongoose';

export interface UserInterface extends Document {
    email?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    merchant?: mongoose.Types.ObjectId;
    provider: string;
    googleId?: string;
    role: string;
    favorites?: mongoose.Types.ObjectId[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }

export interface ProductInterface extends Document {
    imageUrl: string;
    name: string;
    color: string;
    sizes: string[];
    description: string;
    category?: mongoose.Types.ObjectId;
    gender: string;
    price: number;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OrderItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    size?: string;
}

export interface OrderInterface extends Document {
    products: OrderItem[];
    buyer: mongoose.Types.ObjectId;
    address: string;
    orderStatus: string;
    orderDate: Date;
    deliveryDate?: Date;
    trackingNumber?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CategoryInterface extends Document {
    name: string;
    genre?: mongoose.Types.ObjectId;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isActive(): boolean;
}

export interface ReportInterface extends Document {
    orderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    reportType: string;
    status: string;
    priority: string;
    adminResponse?: string;
    resolvedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}