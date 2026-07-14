export const timeAgo = (dateStr: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const fullName = (user?: { first_name: string; last_name: string } | null): string => {
  console.log(user,'from helper');
  return user ? `${user.first_name} ${user.last_name}`.trim() : 'Anonymous';
}
