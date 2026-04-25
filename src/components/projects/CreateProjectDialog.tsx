"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient } from "wagmi";
import { parseEther, decodeEventLog } from "viem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TxButton } from "@/components/web3/TxButton";
import { getContracts } from "@/lib/contracts";
import { ProjectFactoryAbi } from "@/lib/abis";
import { PlusCircle, Trash2, Plus } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { saveProjectImage } from "@/lib/projectImages";
import { useEffect } from "react";
import { TagInput } from "@/components/ui/tag-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type ProjectCategory, saveProjectMetadata } from "@/lib/projectMetadata";
import { HelpTooltip } from "@/components/ui/help-tooltip";

interface MilestoneRow {
  title: string;
  goalDkt: string;
  durationDays: string;
}

const DEFAULT_MILESTONE: MilestoneRow = { title: "", goalDkt: "", durationDays: "" };

interface CreateProjectDialogProps {
  onCreated?: () => void;
}

export function CreateProjectDialog({ onCreated }: CreateProjectDialogProps) {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageHash, setImageHash] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [milestones, setMilestones] = useState<MilestoneRow[]>([{ ...DEFAULT_MILESTONE }]);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const publicClient = usePublicClient();
  const { writeContractAsync, isPending, error: writeError } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const txState =
    isPending ? "pending" :
    isConfirming ? "confirming" :
    isSuccess ? "success" :
    writeError ? "error" :
    "idle";

  const isBusy = txState === "pending" || txState === "confirming";

  // Save project metadata when transaction succeeds
  useEffect(() => {
    if (isSuccess && receipt && publicClient) {
      // Parse logs to find ProjectCreated event
      try {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: ProjectFactoryAbi,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === "ProjectCreated") {
              const projectAddress = (decoded.args as any).projectAddress;
              if (projectAddress) {
                // Save image if exists
                if (imageHash) {
                  saveProjectImage(projectAddress, imageHash, imageUrl);
                }

                // Save metadata if exists
                if (category || tags.length > 0) {
                  saveProjectMetadata(projectAddress, {
                    category: category || undefined,
                    tags,
                  });
                }

                console.log("Saved project metadata for", projectAddress);
              }
              break;
            }
          } catch {
            // Not our event, continue
          }
        }
      } catch (err) {
        console.error("Error saving project metadata:", err);
      }
    }
  }, [isSuccess, receipt, imageHash, imageUrl, category, tags, publicClient]);

  // Validate: project title + all milestone rows must be filled
  const isFormValid =
    title.trim().length > 0 &&
    milestones.length > 0 &&
    milestones.every(
      (m) =>
        m.title.trim().length > 0 &&
        m.goalDkt.trim().length > 0 && parseFloat(m.goalDkt) > 0 &&
        m.durationDays.trim().length > 0 && parseInt(m.durationDays) >= 1
    );

  function addMilestone() {
    setMilestones((prev) => [...prev, { ...DEFAULT_MILESTONE }]);
  }

  function removeMilestone(idx: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateMilestone(idx: number, field: keyof MilestoneRow, value: string) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  }

  async function handleCreate() {
    if (!isFormValid) return;
    try {
      const milestoneTitles    = milestones.map((m) => m.title.trim());
      const milestoneGoals     = milestones.map((m) => parseEther(m.goalDkt));
      const milestoneDurations = milestones.map((m) =>
        BigInt(Math.floor(parseFloat(m.durationDays) * 24 * 60 * 60))
      );

      const hash = await writeContractAsync({
        address: contracts.projectFactory,
        abi: ProjectFactoryAbi,
        functionName: "createProject",
        args: [title.trim(), milestoneTitles, milestoneGoals, milestoneDurations],
        // Gas estimation is unreliable for BeaconProxy deployments — the EVM
        // simulator inflates the estimate far beyond the per-tx limit (25M on Base).
        // Actual median cost from benchmarks is ~525k; 800k gives a safe buffer.
        gas: 800_000n,
      });
      setTxHash(hash);
    } catch (err: any) {
      console.error("CreateProject error:", err);
      console.error("Short message:", err?.shortMessage);
      console.error("Revert reason:", err?.cause?.reason || err?.cause?.data?.message || err?.reason);
      console.error("Full error cause:", JSON.stringify(err?.cause, null, 2));
    }
  }

  function resetForm() {
    setTitle("");
    setCategory("");
    setTags([]);
    setImageHash("");
    setImageUrl("");
    setMilestones([{ ...DEFAULT_MILESTONE }]);
    setTxHash(undefined);
  }

  function handleOpenChange(val: boolean) {
    if (!val && !isBusy) resetForm();
    if (val || !isBusy) setOpen(val);
  }

  function handleSuccessClose() {
    setOpen(false);
    resetForm();
    onCreated?.();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Research Project</DialogTitle>
          <DialogDescription>
            Deploy a new milestone-based crowdfunding project on DChain.
            Each milestone has its own goal, duration, and donor vote for fund release.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-green-400 text-center">
              Project created successfully on-chain!
            </p>
            <p className="text-xs text-muted-foreground font-mono text-center break-all">
              tx: {txHash}
            </p>
            <Button className="w-full" onClick={handleSuccessClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-5 py-2">
              {/* Project title */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="project-title">Project Title</Label>
                  <HelpTooltip content="A clear, descriptive title for your research project. This will be displayed publicly and help supporters understand your work." />
                </div>
                <Input
                  id="project-title"
                  placeholder="e.g. AI-driven drug discovery for tuberculosis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isBusy}
                  maxLength={120}
                />
              </div>

              {/* Project Image */}
              <div className="space-y-1.5">
                <Label>Project Image (Optional)</Label>
                <ImageUpload
                  onUpload={(hash, url) => {
                    setImageHash(hash);
                    setImageUrl(url);
                  }}
                  onRemove={() => {
                    setImageHash("");
                    setImageUrl("");
                  }}
                  currentImage={imageUrl}
                  disabled={isBusy}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <HelpTooltip content="Categorize your project to help supporters discover it through filtered searches. Choose the category that best represents your research field." />
                </div>
                <Select value={category} onValueChange={(v) => setCategory(v as ProjectCategory)} disabled={isBusy}>
                  <SelectTrigger id="category" className="h-12 rounded-xl">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism border-white/10">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>Tags (Optional)</Label>
                  <HelpTooltip content="Add up to 5 tags to help supporters find your project. Use relevant keywords like 'machine-learning', 'clinical-trial', or specific disease names." />
                </div>
                <TagInput
                  tags={tags}
                  onChange={setTags}
                  maxTags={5}
                  placeholder="e.g., machine-learning, covid-19, clinical-trial"
                  disabled={isBusy}
                />
              </div>

              {/* Milestone rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label>Milestones</Label>
                    <HelpTooltip content="Break your project into stages with individual funding goals and deadlines. Each milestone must be completed before funds are released. Deadlines run sequentially from project start." />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Deadlines are cumulative (sequential)
                  </span>
                </div>

                {milestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                        Milestone {idx + 1}
                      </span>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          disabled={isBusy}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
                          aria-label="Remove milestone"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`ms-title-${idx}`} className="text-xs">Title</Label>
                      <Input
                        id={`ms-title-${idx}`}
                        placeholder="e.g. Literature review & dataset collection"
                        value={ms.title}
                        onChange={(e) => updateMilestone(idx, "title", e.target.value)}
                        disabled={isBusy}
                        maxLength={120}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`ms-goal-${idx}`} className="text-xs">Goal (DKT)</Label>
                        <Input
                          id={`ms-goal-${idx}`}
                          type="number"
                          placeholder="500"
                          min="0"
                          step="1"
                          value={ms.goalDkt}
                          onChange={(e) => updateMilestone(idx, "goalDkt", e.target.value)}
                          disabled={isBusy}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`ms-dur-${idx}`} className="text-xs">Duration (days)</Label>
                        <Input
                          id={`ms-dur-${idx}`}
                          type="number"
                          placeholder="30"
                          min="1"
                          step="1"
                          value={ms.durationDays}
                          onChange={(e) => updateMilestone(idx, "durationDays", e.target.value)}
                          disabled={isBusy}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-white/20 text-muted-foreground hover:text-foreground"
                  onClick={addMilestone}
                  disabled={isBusy || milestones.length >= 10}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Milestone
                </Button>
              </div>
            </div>

            <DialogFooter>
              <TxButton
                txState={txState as "idle" | "pending" | "confirming" | "success" | "error"}
                idleLabel="Deploy Project"
                disabled={!isFormValid}
                onClick={handleCreate}
                className="w-full"
              />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
