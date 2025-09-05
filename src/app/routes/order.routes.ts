import express from 'express';
import { 
    getAllOrders,
    getOrderById,
    getOrdersByUserId,
    getOrdersByStatus,
    addOrder,
    updateOrder,
    deleteOrder,
    cancelOrder
} from '../controllers/order.controller';

const router = express.Router();

router.route('/').get(getAllOrders);
router.route('/:id').get(getOrderById);
router.route('/user/:id').get(getOrdersByUserId);
router.route('/status/:status').get(getOrdersByStatus);
router.route('/').post(addOrder);
router.route('/:id').put(updateOrder);
router.route('/:id').delete(deleteOrder);
router.route('/:id/cancel').patch(cancelOrder);

export default router;
