import mongoose, { Schema } from 'mongoose';
import { REPORT_TYPE, REPORT_STATUS, REPORT_PRIORITY } from '../utils/constants';
import { ReportInterface } from '../utils/types';

const ReportSchema: Schema<ReportInterface> = new Schema<ReportInterface>({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'Report content must be at least 10 characters long'],
        maxlength: [2000, 'Report content cannot exceed 2000 characters']
    },
    reportType: {
        type: String,
        required: true,
        enum: Object.values(REPORT_TYPE),
        default: REPORT_TYPE.Other
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(REPORT_STATUS),
        default: REPORT_STATUS.Open
    },
    priority: {
        type: String,
        required: true,
        enum: Object.values(REPORT_PRIORITY),
        default: REPORT_PRIORITY.Medium
    },
    adminResponse: {
        type: String,
        trim: true,
        maxlength: [1000, 'Admin response cannot exceed 1000 characters']
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true,
    versionKey: false
});

ReportSchema.index({ userId: 1 });
ReportSchema.index({ orderId: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ reportType: 1 });
ReportSchema.index({ priority: 1 });
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ userId: 1, status: 1 });

ReportSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === REPORT_STATUS.Resolved && !this.resolvedAt) {
        this.resolvedAt = new Date();
    }
    next();
});

ReportSchema.methods.isResolved = function() {
    return this.status === REPORT_STATUS.Resolved || this.status === REPORT_STATUS.Closed;
};

ReportSchema.methods.canBeModified = function() {
    return this.status === REPORT_STATUS.Open || this.status === REPORT_STATUS.InProgress;
};

ReportSchema.methods.resolve = function(adminResponse?: string) {
    this.status = REPORT_STATUS.Resolved;
    this.resolvedAt = new Date();
    if (adminResponse) {
        this.adminResponse = adminResponse;
    }
    return this.save();
};

const ReportModel = mongoose.model<ReportInterface>('Report', ReportSchema);
export default ReportModel;
