import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserServices';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';

import { Config } from '../config';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository); // Dependency Injection
const authController = new AuthController(
    userService,
    logger,
    Config.PRIVATE_KEY,
); // Dependency Injection

router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
