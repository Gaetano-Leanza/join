export function getAvatarColor(name: string): string {
  const avatarColors = [
    '#F44336','#E91E63','#9C27B0','#3F51B5','#03A9F4',
    '#009688','#4CAF50','#FFC107','#FF9800','#795548'
  ];
  if (!name) return avatarColors[0];
  return avatarColors[name.trim().charCodeAt(0) % avatarColors.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('');
}