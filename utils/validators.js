const { body } = require('express-validator');
const User = require('../models/user')

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Enter correct email')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('User with this email already exists');
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),
  body('password', 'The password must contain at least 6 symbols')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match');
      }

      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 3 })
    .withMessage('The name must contain at least 3 symbols')
    .trim()
];

exports.courseValidators = [
  body('title').isLength({min: 3}).withMessage('Title must contain at least 3 symbols'),
  body('price').isNumeric().withMessage('Enter correct price'),
  body('img', 'Enter correct image URL').isURL()
]