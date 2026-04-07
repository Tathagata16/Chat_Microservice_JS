import express from 'express';
import {login,signup,logout} from '../controller/authController.js';
import {getAllUsers} from '../controller/userController.js';
import {auth} from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/allusers', getAllUsers);


export default router;