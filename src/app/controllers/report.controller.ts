import { Request, Response } from 'express';
import ReportModel from '../models/report.model';
import { REPORT_STATUS, REPORT_TYPE, REPORT_PRIORITY } from '../utils/constants';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const getAllReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        const status = req.query.status as string;
        const reportType = req.query.type as string;
        const priority = req.query.priority as string;

        const filter: any = {};
        if (status) filter.status = status;
        if (reportType) filter.reportType = reportType;
        if (priority) filter.priority = priority;

        const reports = await ReportModel.find(filter)
            .populate('userId', 'firstName lastName email')
            .populate('orderId', 'orderStatus orderDate')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalReports = await ReportModel.countDocuments(filter);

        res.status(200).json({
            reports,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReports / limit),
                totalReports,
                hasNextPage: page < Math.ceil(totalReports / limit),
                hasPrevPage: page > 1
            },
            filters: { status, reportType, priority }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch reports'
        });
    }
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
    try {
        const report = await ReportModel.findById(req.params.id)
            .populate('userId', 'firstName lastName email phoneNumber')
            .populate('orderId', 'orderStatus orderDate products');

        if (!report) {
            res.status(404).json({
                status: 'failed',
                error: 'Report not found'
            });
            return;
        }

        res.status(200).json({
            report
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch report'
        });
    }
};

export const getReportsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;

        const filter: any = { userId: req.params.id };
        if (status) filter.status = status;

        const reports = await ReportModel.find(filter)
            .populate('orderId', 'orderStatus orderDate')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalReports = await ReportModel.countDocuments(filter);

        res.status(200).json({
            reports,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReports / limit),
                totalReports,
                hasNextPage: page < Math.ceil(totalReports / limit),
                hasPrevPage: page > 1
            },
            userId: req.params.id
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch user reports'
        });
    }
};

export const getReportsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;
        
        const validStatuses = Object.values(REPORT_STATUS);
        if (!validStatuses.includes(status as any)) {
            res.status(400).json({
                status: 'failed',
                error: `Invalid report status. Valid statuses: ${validStatuses.join(', ')}`
            });
            return;
        }

        const reports = await ReportModel.find({ status })
            .populate('userId', 'firstName lastName email')
            .populate('orderId', 'orderStatus orderDate')
            .sort({ createdAt: -1 });

        res.status(200).json({
            reports,
            count: reports.length,
            status: status
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch reports by status'
        });
    }
};

export const addReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { orderId, content, reportType, priority } = req.body;
        const userId = req.user?.id;

        if (!orderId || !content) {
            res.status(400).json({
                status: 'failed',
                error: 'Order ID and content are required'
            });
            return;
        }

        if (content.trim().length < 10) {
            res.status(400).json({
                status: 'failed',
                error: 'Report content must be at least 10 characters long'
            });
            return;
        }

        const reportData = {
            orderId,
            userId,
            content: content.trim(),
            reportType: reportType || REPORT_TYPE.Other,
            priority: priority || REPORT_PRIORITY.Medium
        };

        const newReport = await ReportModel.create(reportData);
        await newReport.populate('userId', 'firstName lastName email');
        await newReport.populate('orderId', 'orderStatus orderDate');

        res.status(201).json({
            status: 'success',
            report: newReport
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to create report'
        });
    }
};

export const updateReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { content, reportType, priority } = req.body;

        const report = await ReportModel.findById(req.params.id);

        if (!report) {
            res.status(404).json({
                status: 'failed',
                error: 'Report not found'
            });
            return;
        }

        if (!report.canBeModified()) {
            res.status(400).json({
                status: 'failed',
                error: 'Report cannot be modified. It may have already been resolved or closed.'
            });
            return;
        }

        const updateData: any = {};
        if (content !== undefined) {
            if (content.trim().length < 10) {
                res.status(400).json({
                    status: 'failed',
                    error: 'Report content must be at least 10 characters long'
                });
                return;
            }
            updateData.content = content.trim();
        }
        if (reportType) updateData.reportType = reportType;
        if (priority) updateData.priority = priority;

        const updatedReport = await ReportModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('userId', 'firstName lastName email')
        .populate('orderId', 'orderStatus orderDate');

        res.status(200).json({
            status: 'success',
            report: updatedReport
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to update report'
        });
    }
};

export const deleteReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const report = await ReportModel.findById(req.params.id);

        if (!report) {
            res.status(404).json({
                status: 'failed',
                error: 'Report not found'
            });
            return;
        }

        if (!report.canBeModified()) {
            res.status(400).json({
                status: 'failed',
                error: 'Report cannot be deleted. It may have already been resolved or closed.'
            });
            return;
        }

        await ReportModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'Report deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to delete report'
        });
    }
};

export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, adminResponse } = req.body;

        if (!status) {
            res.status(400).json({
                status: 'failed',
                error: 'Status is required'
            });
            return;
        }

        const validStatuses = Object.values(REPORT_STATUS);
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                status: 'failed',
                error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
            });
            return;
        }

        const report = await ReportModel.findById(req.params.id);

        if (!report) {
            res.status(404).json({
                status: 'failed',
                error: 'Report not found'
            });
            return;
        }

        report.status = status;
        if (adminResponse) {
            report.adminResponse = adminResponse.trim();
        }

        if (status === REPORT_STATUS.Resolved && !report.resolvedAt) {
            report.resolvedAt = new Date();
        }

        await report.save();
        await report.populate('userId', 'firstName lastName email');
        await report.populate('orderId', 'orderStatus orderDate');

        res.status(200).json({
            status: 'success',
            report,
            message: `Report status updated to ${status}`
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to update report status'
        });
    }
};

export const resolveReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { adminResponse } = req.body;

        const report = await ReportModel.findById(req.params.id);

        if (!report) {
            res.status(404).json({
                status: 'failed',
                error: 'Report not found'
            });
            return;
        }

        if (report.isResolved()) {
            res.status(400).json({
                status: 'failed',
                error: 'Report is already resolved'
            });
            return;
        }

        await report.resolve(adminResponse?.trim());
        await report.populate('userId', 'firstName lastName email');
        await report.populate('orderId', 'orderStatus orderDate');

        res.status(200).json({
            status: 'success',
            report,
            message: 'Report resolved successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to resolve report'
        });
    }
};

export const getReportStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalReports = await ReportModel.countDocuments({});
        const openReports = await ReportModel.countDocuments({ status: REPORT_STATUS.Open });
        const inProgressReports = await ReportModel.countDocuments({ status: REPORT_STATUS.InProgress });
        const resolvedReports = await ReportModel.countDocuments({ status: REPORT_STATUS.Resolved });
        const closedReports = await ReportModel.countDocuments({ status: REPORT_STATUS.Closed });

        const reportsByType = await ReportModel.aggregate([
            { $group: { _id: '$reportType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const reportsByPriority = await ReportModel.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            status: 'success',
            stats: {
                total: totalReports,
                byStatus: {
                    open: openReports,
                    inProgress: inProgressReports,
                    resolved: resolvedReports,
                    closed: closedReports
                },
                byType: reportsByType,
                byPriority: reportsByPriority
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'failed',
            error: error.message || 'Failed to fetch report statistics'
        });
    }
};
