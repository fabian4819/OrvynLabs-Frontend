import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  toggleFavorite,
} from "./favorites";

describe("Favorites", () => {
  const walletAddress = "0x1234567890123456789012345678901234567890";
  const projectAddress1 = "0xabcdef1234567890abcdef1234567890abcdef12";
  const projectAddress2 = "0x9876543210fedcba9876543210fedcba98765432";

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getFavorites", () => {
    it("returns empty array for new wallet", () => {
      const favorites = getFavorites(walletAddress);
      expect(favorites).toEqual([]);
    });

    it("returns stored favorites", () => {
      // addFavorite will properly store the favorites
      addFavorite(walletAddress, projectAddress1);
      addFavorite(walletAddress, projectAddress2);

      const favorites = getFavorites(walletAddress);
      expect(favorites.length).toBe(2);
      expect(favorites).toContain(projectAddress1);
      expect(favorites).toContain(projectAddress2);
    });

    it("handles corrupted data", () => {
      localStorage.setItem(
        `favorites_${walletAddress.toLowerCase()}`,
        "corrupted data"
      );

      const favorites = getFavorites(walletAddress);
      expect(favorites).toEqual([]);
    });
  });

  describe("isFavorite", () => {
    it("returns false for non-favorite project", () => {
      expect(isFavorite(walletAddress, projectAddress1)).toBe(false);
    });

    it("returns true for favorite project", () => {
      addFavorite(walletAddress, projectAddress1);
      expect(isFavorite(walletAddress, projectAddress1)).toBe(true);
    });

    it("is case-insensitive", () => {
      addFavorite(walletAddress, projectAddress1.toLowerCase());
      expect(isFavorite(walletAddress, projectAddress1.toUpperCase())).toBe(true);
    });
  });

  describe("addFavorite", () => {
    it("adds a favorite", () => {
      addFavorite(walletAddress, projectAddress1);

      const favorites = getFavorites(walletAddress);
      expect(favorites).toContain(projectAddress1);
    });

    it("does not add duplicates", () => {
      addFavorite(walletAddress, projectAddress1);
      addFavorite(walletAddress, projectAddress1);

      const favorites = getFavorites(walletAddress);
      expect(favorites).toEqual([projectAddress1]);
    });

    it("adds multiple favorites", () => {
      addFavorite(walletAddress, projectAddress1);
      addFavorite(walletAddress, projectAddress2);

      const favorites = getFavorites(walletAddress);
      expect(favorites).toHaveLength(2);
      expect(favorites).toContain(projectAddress1);
      expect(favorites).toContain(projectAddress2);
    });
  });

  describe("removeFavorite", () => {
    it("removes a favorite", () => {
      addFavorite(walletAddress, projectAddress1);
      addFavorite(walletAddress, projectAddress2);

      removeFavorite(walletAddress, projectAddress1);

      const favorites = getFavorites(walletAddress);
      expect(favorites).not.toContain(projectAddress1);
      expect(favorites).toContain(projectAddress2);
    });

    it("handles removing non-existent favorite", () => {
      expect(() => {
        removeFavorite(walletAddress, projectAddress1);
      }).not.toThrow();
    });
  });

  describe("toggleFavorite", () => {
    it("adds favorite when not present", () => {
      const result = toggleFavorite(walletAddress, projectAddress1);

      expect(result).toBe(true);
      expect(isFavorite(walletAddress, projectAddress1)).toBe(true);
    });

    it("removes favorite when present", () => {
      addFavorite(walletAddress, projectAddress1);

      const result = toggleFavorite(walletAddress, projectAddress1);

      expect(result).toBe(false);
      expect(isFavorite(walletAddress, projectAddress1)).toBe(false);
    });

    it("toggles correctly multiple times", () => {
      // Add
      let result = toggleFavorite(walletAddress, projectAddress1);
      expect(result).toBe(true);

      // Remove
      result = toggleFavorite(walletAddress, projectAddress1);
      expect(result).toBe(false);

      // Add again
      result = toggleFavorite(walletAddress, projectAddress1);
      expect(result).toBe(true);
    });
  });
});
