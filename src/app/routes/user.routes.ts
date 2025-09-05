import express from 'express';
import { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    addFavorite, 
    deleteFavorite 
} from '../controllers/user.controller';

const router = express.Router();

router.route('/').get(getAllUsers);
router.route('/:id').get(getUserById);
router.route('/:id').put(updateUser);
router.route('/:id').delete(deleteUser);
router.route('/:id/favorite/:favorite').post(addFavorite);
router.route('/:id/favorite/:favorite').delete(deleteFavorite);

export default router;
