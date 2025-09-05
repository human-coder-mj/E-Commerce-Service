import express from 'express';
import { 
    getAllReports,
    getReportById,
    getReportsByUserId,
    getReportsByStatus,
    addReport,
    updateReport,
    deleteReport,
    updateReportStatus,
    resolveReport,
    getReportStats
} from '../controllers/report.controller';

const router = express.Router();

router.route('/').get(getAllReports);
router.route('/stats').get(getReportStats);
router.route('/status/:status').get(getReportsByStatus);
router.route('/user/:id').get(getReportsByUserId);
router.route('/:id').get(getReportById);
router.route('/').post(addReport);
router.route('/:id').put(updateReport);
router.route('/:id').delete(deleteReport);
router.route('/:id/status').patch(updateReportStatus);
router.route('/:id/resolve').patch(resolveReport);

export default router;
