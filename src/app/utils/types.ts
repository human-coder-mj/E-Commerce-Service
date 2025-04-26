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
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    updated?: Date;
    created: Date;
  }