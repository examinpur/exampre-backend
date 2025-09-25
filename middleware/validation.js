const { body, validationResult } = require('express-validator');

// Validation middleware for registration
const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array')
    .custom((subjects) => {
      const validSubjects = ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'social-study'];
      if (subjects && subjects.length > 0) {
        for (let subject of subjects) {
          if (!validSubjects.includes(subject)) {
            throw new Error(`Invalid subject: ${subject}`);
          }
        }
      }
      return true;
    }),
    
  body('examGoals')
    .optional()
    .isArray()
    .withMessage('Exam goals must be an array'),
    
  body('teachingSubjects')
    .optional()
    .isArray()
    .withMessage('Teaching subjects must be an array'),
    
  body('teachingExperience')
    .optional()
    .isString()
    .withMessage('Teaching experience must be a string'),
    
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateRegister,
  validateLogin
};