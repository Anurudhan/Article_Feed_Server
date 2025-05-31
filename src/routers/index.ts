// src/routes/index.route.ts
import { Router} from 'express';
import { authController } from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';
import { block, create, dislike, edit, getPreferenceArticles, getUserArticles, like, removeDislike, removeLike, softDelete, unblock } from '../controllers/articleControllers';
const router = Router();


router.post('/login', authController.login.bind(authController));
router.delete('/logout',authenticateUser, authController.logout.bind(authController));
router.post('/signup', authController.signup.bind(authController));
router.get('/', authenticateUser, authController.getUser.bind(authController));
router.post('/article/', create);
router.put('/article/:id',authenticateUser, edit);
router.delete('/article/:id',authenticateUser,softDelete);
router.patch('/article/like/:id',authenticateUser, like);
router.patch('/article/remove-like/:id',authenticateUser, removeLike);
router.patch('/article/dislike/:id',authenticateUser, dislike);
router.patch('/article/remove-dislike/:id',authenticateUser,removeDislike);
router.patch('/article/block/:id',authenticateUser,block);
router.patch('/article/unblock/:id',authenticateUser, unblock);
router.get('/article', authenticateUser, getUserArticles);
router.get('/article/Preference', authenticateUser,getPreferenceArticles)

export default router;
