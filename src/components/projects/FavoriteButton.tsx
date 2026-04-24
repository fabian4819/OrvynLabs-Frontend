"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAccount } from "wagmi";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { motion } from "framer-motion";

interface FavoriteButtonProps {
  projectAddress: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FavoriteButton({
  projectAddress,
  size = "md",
  showLabel = false
}: FavoriteButtonProps) {
  const { address } = useAccount();
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (address) {
      setFavorited(isFavorite(address, projectAddress));
    }
  }, [address, projectAddress]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!address) return;

    const newState = toggleFavorite(address, projectAddress);
    setFavorited(newState);
  };

  if (!address) return null;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.9 }}
      className={`${buttonSizeClasses[size]} rounded-full glass-morphism border border-white/10 hover:border-red-500/30 transition-all group relative`}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`${sizeClasses[size]} transition-all ${
          favorited
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground group-hover:text-red-400"
        }`}
      />

      {favorited && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 rounded-full bg-red-500/20 blur-sm"
        />
      )}

      {showLabel && (
        <span className="ml-1.5 text-xs font-medium">
          {favorited ? "Favorited" : "Favorite"}
        </span>
      )}
    </motion.button>
  );
}
