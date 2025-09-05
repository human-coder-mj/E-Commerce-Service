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