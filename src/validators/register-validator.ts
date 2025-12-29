import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
    },
});

// export default [
//     body('email').notEmpty().withMessage('Email is required'),
//     body('firstName').notEmpty(),
//     body('lastName').notEmpty(),
//     body('password').notEmpty(),
// ];
