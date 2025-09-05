import express from 'express';
import { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    addFavorite, 
    deleteFavorite 
} from '../controllers/user.controller';
import { login, register } from '../controllers/auth.controller';

const router = express.Router();

router.route('/').get(getAllUsers);
router.route('/:id').get(getUserById);
router.route('/:id').put(updateUser);
router.route('/:id').delete(deleteUser);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/:id/favorite/:favorite').post(addFavorite);
router.route('/:id/favorite/:favorite').delete(deleteFavorite);

export default router;
