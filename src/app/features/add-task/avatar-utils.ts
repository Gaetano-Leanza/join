/**
 * Gets a color for an avatar based on the provided name.
 * It returns a color from a predefined list of colors. The color is determined by the character code of the first letter of the name.
 * @param {string} name - The name to get the avatar color for.
 * @returns {string} The hex color code for the avatar.
 */
export function getAvatarColor(name: string): string {
  const avatarColors = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FFC107', '#FF9800', '#795548'
  ];
  if (!name) return avatarColors[0];
  return avatarColors[name.trim().charCodeAt(0) % avatarColors.length];
}

/**
 * Gets the initials from a name.
 * It takes a full name, splits it into parts, and returns the first letter of the first two parts in uppercase.
 * @param {string} name - The full name to get the initials from.
 * @returns {string} The initials of the name (e.g., "John Doe" -> "JD").
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('');
}