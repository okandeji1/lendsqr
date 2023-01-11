import joi from '@hapi/joi';

export const registerUserSchema = joi.object({
  name: joi.string().required(),
  username: joi.string().required(),
  password: joi.string().required(),
  email: joi.string().email().required(),
});

export const loginUserSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().min(6).required(),
});

export const getUserSchema = joi.object({
  username: joi.string(),
  name: joi.string(),
  email: joi.string(),
  limit: joi.number().min(0).max(1000).default(50),
  page: joi.number().min(1).default(1),
});

export const updateUserSchema = joi.object({
  username: joi.string().required(),
  name: joi.string(),
  password: joi.string(),
  email: joi.string(),
});

export const deleteUserSchema = joi.object({
  username: joi.string().required(),
});
