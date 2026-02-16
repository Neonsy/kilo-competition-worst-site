// Hostile validation messages

export const hostileValidationMessages = [
  "Incorrect. Try being less you.",
  "This field is mandatory unless you don't want it to work.",
  "We didn't like that answer.",
  "Your name is too normal.",
  "Email contains suspicious vowels.",
  "That shoe size is philosophically inconsistent.",
  "Error: Success (maybe)",
  "Please wait... no, actually try again.",
  "That input has bad vibes.",
  "Our AI judged you and found you wanting.",
  "Field validation failed because reasons.",
  "The server is disappointed in you.",
  "This value is not optimal for your user experience.",
  "Input rejected due to cosmic interference.",
  "Your answer lacks conviction.",
  "This field requires more enthusiasm.",
  "Validation error: Too predictable.",
  "The form spirits are not pleased.",
  "Please enter a value that doesn't make us sad.",
  "That's not wrong, but it's not right either.",
  "Your input has been noted and criticized.",
  "This field expects better from you.",
  "Error 418: Input is too tepid.",
  "Validation failed out of spite.",
  "That answer is technically valid but spiritually wrong.",
  "The algorithm doesn't trust you.",
  "Please try again with more pizzazz.",
  "Input declined for your own good.",
  "This field is experiencing existential doubt.",
  "Your answer has been forwarded to HR.",
];

export const loadingMessages = [
  "Analyzing vibes...",
  "Still analyzing...",
  "Consulting the oracle...",
  "Oracle is on break...",
  "Processing your choices...",
  "Judging your decisions...",
  "Calculating regret index...",
  "Loading more loading screens...",
  "Pretending to work...",
  "Actually working now...",
  "Almost there (we lie)...",
  "Compiling your mistakes...",
  "Generating personalized disappointment...",
  "Contacting server in alternate dimension...",
  "Downloading more RAM...",
  "Defragmenting your choices...",
  "Reticulating splines...",
  "Computing the uncomputable...",
  "Thinking about thinking...",
  "Your patience is being tested...",
];

export function getRandomValidationMessage(): string {
  return hostileValidationMessages[Math.floor(Math.random() * hostileValidationMessages.length)];
}

export function getRandomLoadingMessage(): string {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}

export function getValidationForField(fieldName: string, value: string): { valid: boolean; message: string } {
  // Randomly fail validation for fun
  const chaos = Math.random();
  
  if (chaos > 0.7) {
    return {
      valid: false,
      message: getRandomValidationMessage(),
    };
  }
  
  // Field-specific hostile validation
  switch (fieldName) {
    case 'name':
      if (value.length < 2) {
        return { valid: false, message: "Names must have at least 2 characters. Yours is too brief." };
      }
      if (value.toLowerCase().includes('john') || value.toLowerCase().includes('jane')) {
        return { valid: false, message: "Your name is too normal. Please enter a more interesting name." };
      }
      if (value.length > 20) {
        return { valid: false, message: "Your name is too ambitious. Tone it down." };
      }
      break;
      
    case 'email':
      if (!value.includes('@')) {
        return { valid: false, message: "Email must contain the sacred @ symbol." };
      }
      if (value.includes('a') && value.includes('e') && value.includes('i') && value.includes('o') && value.includes('u')) {
        return { valid: false, message: "Email contains suspicious vowels. Are you trying to say something?" };
      }
      if (value.includes('gmail')) {
        return { valid: false, message: "We don't trust that email provider. Try something more obscure." };
      }
      break;
      
    case 'shoeSize':
      const size = parseFloat(value);
      if (isNaN(size)) {
        return { valid: false, message: "Shoe size must be a number. Your feet know this." };
      }
      if (size < 0 || size > 50) {
        return { valid: false, message: "Shoe size must be between 0 and 50. We checked." };
      }
      if (size === 10) {
        return { valid: false, message: "Size 10 is too mainstream. Try again." };
      }
      break;
      
    case 'errorMessage':
      if (value.toLowerCase().includes('success')) {
        return { valid: false, message: "That's not an error message. That's optimism. We don't do that here." };
      }
      if (value.length < 5) {
        return { valid: false, message: "Error message too short. Where's the drama?" };
      }
      break;
  }
  
  // Sometimes still fail randomly even if everything is correct
  if (chaos > 0.9) {
    return {
      valid: false,
      message: "Everything looks correct, but we're rejecting it anyway. Try again.",
    };
  }
  
  return { valid: true, message: "Accepted (for now)" };
}
