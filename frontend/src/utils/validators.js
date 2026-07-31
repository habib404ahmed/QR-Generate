// Form validation utilities
export const validators = {
  /**
   * Validate student registration form
   */
  registration: ({ name, department, mobile }) => {
    const errors = {};

    if (!name || name.trim().length === 0) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!department || department.trim().length === 0) {
      errors.department = 'Please select your department';
    }

    if (!mobile || mobile.trim().length === 0) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
  },

  /**
   * Validate admin login form
   */
  login: ({ username, password }) => {
    const errors = {};
    if (!username?.trim()) errors.username = 'Username is required';
    if (!password?.trim()) errors.password = 'Password is required';
    return { errors, isValid: Object.keys(errors).length === 0 };
  },
};
