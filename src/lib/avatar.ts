/**
 * Generate a deterministic avatar URL based on wallet address
 * Using DiceBear API for generated avatars
 */
export function getAvatarUrl(address: string): string {
  // Use DiceBear's identicon style for blockchain addresses
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`;
}

/**
 * Generate a gradient background color based on address
 */
export function getGradientColors(address: string): { from: string; to: string } {
  // Use address to generate deterministic colors
  const hash = parseInt(address.slice(2, 10), 16);

  const colors = [
    { from: "from-blue-500", to: "to-purple-500" },
    { from: "from-green-500", to: "to-teal-500" },
    { from: "from-pink-500", to: "to-rose-500" },
    { from: "from-orange-500", to: "to-amber-500" },
    { from: "from-indigo-500", to: "to-blue-500" },
    { from: "from-violet-500", to: "to-purple-500" },
    { from: "from-cyan-500", to: "to-blue-500" },
    { from: "from-fuchsia-500", to: "to-pink-500" },
  ];

  return colors[hash % colors.length];
}

/**
 * Get initials from address (first 4 chars after 0x)
 */
export function getAddressInitials(address: string): string {
  return address.slice(2, 6).toUpperCase();
}
