import mongoose, { Schema } from 'mongoose';
import { GENDER, PRODUCT_STATUS } from '../utils/constants';
import { ProductInterface } from '../utils/types';

const ProductSchema: Schema<ProductInterface> = new Schema<ProductInterface>({
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    sizes: {
        type: [String],
        required: true,
        validate: {
            validator: function(sizes: string[]) {
                return sizes.length > 0;
            },
            message: 'At least one size must be specified'
        }
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    gender: {
        type: String,
        required: true,
        enum: [GENDER.Male, GENDER.Female, GENDER.Unisex]
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    status: {
        type: Boolean,
        default: PRODUCT_STATUS.Active
    }
}, {
    timestamps: true,
    versionKey: false
});

ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ gender: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ status: 1 });

const ProductModel = mongoose.model<ProductInterface>('Product', ProductSchema);
export default ProductModel;
