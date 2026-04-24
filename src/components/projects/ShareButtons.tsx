"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  compact?: boolean;
}

export function ShareButtons({ title, description, url, compact = false }: ShareButtonsProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use current URL if not provided
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = description || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const encodedTitle = encodeURIComponent(title);

    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "reddit":
        shareLink = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        <AnimatePresence>
          {showOptions && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowOptions(false)}
              />

              {/* Share menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 p-2 glass-morphism border border-white/10 rounded-xl shadow-xl z-50 min-w-[200px]"
              >
                <div className="space-y-1">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>

                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    <Twitter className="h-4 w-4 text-blue-400" />
                    <span>Twitter</span>
                  </button>

                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    <Linkedin className="h-4 w-4 text-blue-500" />
                    <span>LinkedIn</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full version with all buttons visible
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Link
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("twitter")}
        className="gap-2"
      >
        <Twitter className="h-4 w-4 text-blue-400" />
        Twitter
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("facebook")}
        className="gap-2"
      >
        <Facebook className="h-4 w-4 text-blue-600" />
        Facebook
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("linkedin")}
        className="gap-2"
      >
        <Linkedin className="h-4 w-4 text-blue-500" />
        LinkedIn
      </Button>
    </div>
  );
}
