// client/src/utils/validation.js

/**
 * Validates signup form data.
 * @param {Object} formData - The current state of the signup form.
 * @returns {string|null} - Returns an error message string, or null if validation passes.
 */
export const validateSignupForm = (formData) => {
  // 1. Sanitize inputs
  const nameTrimmed = (formData.fullName || "").trim();
  const emailTrimmed = (formData.email || "").trim();
  const password = formData.password || "";
  const confirmPassword = formData.confirmPassword || "";

  // 2. Define standard regex patterns
  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

  // Presence Check
  if (!nameTrimmed || !emailTrimmed || !password) {
    return "Please fill out all required fields.";
  }

  // Name Rules
  if (!nameRegex.test(nameTrimmed)) {
    return "Name can only contain letters and spaces.";
  }
  if (nameTrimmed.length < 3) {
    return "Name must be at least 3 characters.";
  }
  if (nameTrimmed.length > 50) {
    return "Name cannot exceed 50 characters.";
  }

  // Email Rules
  if (!emailRegex.test(emailTrimmed)) {
    return "Please enter a valid email address.";
  }

  // Password Strength Rules
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.";
  }

  // Password Match Rule
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  // Legal Rules
  if (!formData.terms) {
    return "Please accept the terms and conditions to continue.";
  }

  // Everything is perfect
  return null;
};