import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserServices';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import jwt, { JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';

export class AuthController {
    userService: UserService;

    constructor(
        userService: UserService,
        private logger: Logger,
        private privateKey: string,
    ) {
        this.userService = userService;
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            this.logger.error('Validation error', result.array());
            const error = createHttpError(400, result.array());
            next(error);
            return;
        }
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '******',
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User has been registered', { id: user.id });
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const accessToken = jwt.sign(payload, this.privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service',
            });
            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true, // Very Important
            });
            const refreshToken = jwt.sign(
                payload,
                Config.REFRESH_TOKEN_SECRET!,
                {
                    algorithm: 'HS256',
                    expiresIn: '1y',
                    issuer: 'auth-service',
                },
            );
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 Year
                httpOnly: true,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
