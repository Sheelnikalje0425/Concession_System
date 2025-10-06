export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Student ID validation (customize based on your format)
  studentId: (id) => {
    const idRegex = /^[A-Z0-9]{8,12}$/;
    return idRegex.test(id);
  },

  // Password validation
  password: (password) => {
    return password.length >= 6;
  },

  // Required field validation
  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  // Date validation (must be past date)
  pastDate: (date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today;
  },

  // Minimum length validation
  minLength: (value, min) => {
    return value.length >= min;
  },

  // Maximum length validation
  maxLength: (value, max) => {
    return value.length <= max;
  },

  // Application form validation
  validateApplication: (application) => {
    const errors = {};

    if (!validators.required(application.routeFrom)) {
      errors.routeFrom = 'From station is required';
    }

    if (!validators.required(application.routeTo)) {
      errors.routeTo = 'To station is required';
    }

    if (!validators.required(application.category)) {
      errors.category = 'Category is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Student form validation
  validateStudent: (student) => {
    const errors = {};

    if (!validators.required(student.id)) {
      errors.id = 'Student ID is required';
    } else if (!validators.studentId(student.id)) {
      errors.id = 'Invalid student ID format';
    }

    if (!validators.required(student.name)) {
      errors.name = 'Name is required';
    }

    if (!validators.required(student.email)) {
      errors.email = 'Email is required';
    } else if (!validators.email(student.email)) {
      errors.email = 'Invalid email format';
    }

    if (!validators.required(student.dob)) {
      errors.dob = 'Date of birth is required';
    } else if (!validators.pastDate(student.dob)) {
      errors.dob = 'Date must be in the past';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};