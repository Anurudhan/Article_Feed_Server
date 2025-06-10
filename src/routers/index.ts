// src/routes/index.route.ts
import { Router} from 'express';
import { authController } from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';
import { block, create, dislike, edit, getMyArticles, getPreferenceArticles, like, softDelete } from '../controllers/articleControllers';
const router = Router();


router.post('/login', authController.login.bind(authController));
router.delete('/logout',authenticateUser, authController.logout.bind(authController));
router.post('/signup', authController.signup.bind(authController));
router.route('/').get(authenticateUser, authController.getUser.bind(authController)).put(authenticateUser,authController.updateUser.bind(authController));
router.post('/article',authenticateUser,create);
router.put('/article/:id',authenticateUser, edit);
router.delete('/article/:id',authenticateUser,softDelete);
router.patch('/article/like/:id',authenticateUser, like);
router.patch('/article/dislike/:id',authenticateUser, dislike);
router.patch('/article/block/:id',authenticateUser,block);
router.get('/article/my-articles', authenticateUser, getMyArticles);
router.get('/articles/preferred', authenticateUser,getPreferenceArticles)

export default router;
