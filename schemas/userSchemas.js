import Joi from "joi";

export const createUserSchema = Joi.object({
    password: Joi.string().required().trim().messages({
        'any.required': 'Password is required',
    }),
    email: Joi.string().email().required().trim().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
});

export const resendVerificationEmailSchema  = Joi.object({
    email: Joi.string().email().required().trim().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
})



