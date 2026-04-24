"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getProjectUpdates,
  addProjectUpdate,
  deleteProjectUpdate,
  type ProjectUpdate,
} from "@/lib/projectUpdates";
import { useAccount } from "wagmi";
import { shortenAddress } from "@/lib/utils";
import { MessageSquare, Plus, Trash2, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";

interface ProjectUpdatesProps {
  projectAddress: string;
  researcherAddress: string;
}

export function ProjectUpdates({ projectAddress, researcherAddress }: ProjectUpdatesProps) {
  const { address, isConnected } = useAccount();
  const { addNotification } = useNotifications();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isResearcher = address?.toLowerCase() === researcherAddress.toLowerCase();

  useEffect(() => {
    setUpdates(getProjectUpdates(projectAddress));
  }, [projectAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      const newUpdate = addProjectUpdate(projectAddress, address, title, content);
      setUpdates([newUpdate, ...updates]);
      setTitle("");
      setContent("");
      setShowForm(false);

      addNotification({
        type: "project_created",
        title: "Update Posted",
        message: "Your project update has been published successfully",
      });
    } catch (error) {
      console.error("Failed to post update:", error);
      addNotification({
        type: "milestone_rejected",
        title: "Failed to Post Update",
        message: "There was an error posting your update. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (updateId: string) => {
    if (!address) return;

    const success = deleteProjectUpdate(updateId, address);
    if (success) {
      setUpdates(updates.filter((u) => u.id !== updateId));
      addNotification({
        type: "vote_cast",
        title: "Update Deleted",
        message: "Your project update has been removed",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    // Less than 1 hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
    }

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    // Older - show date
    return date.toLocaleDateString();
  };

  return (
    <Card className="glass-morphism border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Project Updates
            {updates.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {updates.length}
              </Badge>
            )}
          </CardTitle>

          {isConnected && isResearcher && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              {showForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Post Update
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Post Update Form */}
        <AnimatePresence>
          {showForm && isResearcher && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="space-y-2">
                <Label htmlFor="update-title">Update Title</Label>
                <Input
                  id="update-title"
                  placeholder="e.g., Milestone 1 Completed!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-content">Update Details</Label>
                <Textarea
                  id="update-content"
                  placeholder="Share your progress, findings, or next steps..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length} / 1000
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Posting..." : "Post Update"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Updates List */}
        {updates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p>No updates yet</p>
            {isResearcher && (
              <p className="text-xs mt-2">
                Share project progress with your supporters
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-sm">{update.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">
                        {shortenAddress(update.author)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(update.timestamp)}</span>
                    </div>
                  </div>

                  {address?.toLowerCase() === update.author.toLowerCase() && (
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete update"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {update.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
