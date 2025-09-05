import express from 'express';
import { 
    getAllCategories,
    getActiveCategories,
    getCategoryById,
    getCategoryByGenre,
    searchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from '../controllers/category.controller';

const router = express.Router();

router.route('/').get(getAllCategories);
router.route('/active').get(getActiveCategories);
router.route('/search/:search').get(searchCategories);
router.route('/genre/:id').get(getCategoryByGenre);
router.route('/:id').get(getCategoryById);
router.route('/').post(addCategory);
router.route('/:id').put(updateCategory);
router.route('/:id').delete(deleteCategory);
router.route('/:id/toggle').patch(toggleCategoryStatus);

export default router;
