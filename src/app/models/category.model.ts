import mongoose, { Schema } from 'mongoose';
import { PRODUCT_STATUS } from '../utils/constants';
import { CategoryInterface } from '../utils/types';

const CategorySchema: Schema<CategoryInterface> = new Schema<CategoryInterface>({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: [50, 'Category name cannot exceed 50 characters'],
        minlength: [2, 'Category name must be at least 2 characters long']
    },
    genre: {
        type: Schema.Types.ObjectId,
        ref: 'Genre'
    },
    status: {
        type: Boolean,
        default: PRODUCT_STATUS.Active
    }
}, {
    timestamps: true,
    versionKey: false
});

CategorySchema.index({ name: 1 });
CategorySchema.index({ genre: 1 });
CategorySchema.index({ status: 1 });
CategorySchema.index({ name: 1, status: 1 });

CategorySchema.pre('save', function(next) {
    if (this.name) {
        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    }
    next();
});

CategorySchema.methods.isActive = function() {
    return this.status === true;
};

CategorySchema.statics.findActive = function() {
    return this.find({ status: true }).sort({ name: 1 });
};

const Category = mongoose.model<CategoryInterface>('Category', CategorySchema);
export default Category;
