import mongoose, { Schema } from 'mongoose';
import { ORDER_STATUS } from '../utils/constants';
import { OrderInterface, OrderItem } from '../utils/types';

const OrderItemSchema = new Schema<OrderItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    size: {
        type: String,
        trim: true
    }
}, { _id: false });

const OrderSchema: Schema<OrderInterface> = new Schema<OrderInterface>({
    products: {
        type: [OrderItemSchema],
        required: true,
        validate: {
            validator: function(products: OrderItem[]) {
                return products.length > 0;
            },
            message: 'Order must contain at least one product'
        }
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'Address must be at least 10 characters long'],
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    orderStatus: {
        type: String,
        required: true,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.Pending
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date
    },
    trackingNumber: {
        type: String,
        trim: true,
        uppercase: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true,
    versionKey: false
});

OrderSchema.index({ buyer: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ trackingNumber: 1 });

OrderSchema.methods.canBeCancelled = function() {
    return this.orderStatus === ORDER_STATUS.Pending || this.orderStatus === ORDER_STATUS.Processing;
};

OrderSchema.methods.isDelivered = function() {
    return this.orderStatus === ORDER_STATUS.Delivered;
};

const OrderModel = mongoose.model<OrderInterface>('Order', OrderSchema);
export default OrderModel;
