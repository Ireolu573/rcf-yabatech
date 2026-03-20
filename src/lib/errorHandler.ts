const errorMap: Record<string, string> = {
  '23505': 'This entry already exists.',
  '23503': 'Referenced item not found.',
  '23514': 'Invalid input. Please check your data and try again.',
  '42501': 'You do not have permission to perform this action.',
  'PGRST116': 'Invalid request format.',
  'PGRST301': 'Request failed. Please try again.',
};

export function getUserFriendlyError(error: { code?: string; message?: string }): string {
  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }
  console.error('Database error:', error);
  return 'An unexpected error occurred. Please try again.';
}
