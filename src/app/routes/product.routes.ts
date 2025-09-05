import express from 'express';
import { 
    getAllProducts,
    getProductById,
    getProductsByColor,
    getProductsByCategoryId,
    getProductsByGender,
    getProductsByPrice,
    getProductsByStatus,
    getProductsBySearch,
    getProductsByQueries,
    addProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';

const router = express.Router();

router.route('/').get(getAllProducts);
router.route('/search/:search').get(getProductsBySearch);
router.route('/filter').get(getProductsByQueries);
router.route('/price').get(getProductsByPrice);
router.route('/color/:color').get(getProductsByColor);
router.route('/gender/:gender').get(getProductsByGender);
router.route('/status/:status').get(getProductsByStatus);
router.route('/category/:id').get(getProductsByCategoryId);
router.route('/:id').get(getProductById);
router.route('/').post(addProduct);
router.route('/:id').put(updateProduct);
router.route('/:id').delete(deleteProduct);

export default router;
