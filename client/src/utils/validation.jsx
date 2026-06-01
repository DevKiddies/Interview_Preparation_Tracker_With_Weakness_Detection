// client/src/utils/validation.js

/**
 * Validates signup form data.
 * @param {Object} formData - The current state of the signup form.
 * @returns {string|null} - Returns an error message string, or null if validation passes.
 */
export const validateSignupForm = (formData) => {
  // 1. Sanitize inputs
  const usernameTrimmed = (formData.username || "").trim();
  const emailTrimmed = (formData.email || "").trim();
  const password = formData.password || "";
  const confirmPassword = formData.confirmPassword || "";

  // 2. Define standard regex patterns
  const usernameRegex = /^[A-Za-z0-9_]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*]).{8,}$/;

  // Presence Check
  if (!usernameTrimmed || !emailTrimmed || !password) {
    return "Please fill out all required fields.";
  }

  // Name Rules
  if (!usernameRegex.test(usernameTrimmed)) {
    return "Name can only contain letters and spaces.";
  }
  if (usernameTrimmed.length < 3) {
    return "Name must be at least 3 characters.";
  }
  if (usernameTrimmed.length > 50) {
    return "Name cannot exceed 50 characters.";
  }

  // Email Rules
  if (!emailRegex.test(emailTrimmed)) {
    return "Please enter a valid email address.";
  }

  // Password Strength Rules
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
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