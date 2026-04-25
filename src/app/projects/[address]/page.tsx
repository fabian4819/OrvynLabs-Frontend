"use client";

import { use, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TxButton } from "@/components/web3/TxButton";
import { NetworkBadge } from "@/components/web3/NetworkBadge";
import { DonateForm } from "@/components/projects/DonateForm";
import { ShareButtons } from "@/components/projects/ShareButtons";
import { ProjectUpdates } from "@/components/projects/ProjectUpdates";
import {
  shortenAddress,
  formatDeadline,
  formatDkt,
  isExpired,
} from "@/lib/utils";
import { useProject, MilestoneStatus, ProjectStatus, type Milestone } from "@/hooks/useProject";
import { ResearchProjectAbi } from "@/lib/abis";
import {
  User, Clock, Target, Wallet, ArrowLeft, TrendingUp, Zap,
  CheckCircle2, XCircle, Hourglass, ChevronRight, Vote, FileCheck,
  Upload, File as FileIcon, Link as LinkIcon, History, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerContainer, ParallaxBackground } from "@/components/ui/motion";

interface Props {
  params: Promise<{ address: string }>;
}

// ─── Milestone status helpers ────────────────────────────────────────────────
function msLabel(s: MilestoneStatus) {
  switch (s) {
    case MilestoneStatus.Pending:  return "Active";
    case MilestoneStatus.Voting:   return "Voting";
    case MilestoneStatus.Approved: return "Approved";
    case MilestoneStatus.Rejected: return "Rejected";
    case MilestoneStatus.Skipped:  return "Skipped";
  }
}

function msColor(s: MilestoneStatus) {
  switch (s) {
    case MilestoneStatus.Pending:  return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case MilestoneStatus.Voting:   return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case MilestoneStatus.Approved: return "bg-green-500/20 text-green-400 border-green-500/30";
    case MilestoneStatus.Rejected: return "bg-red-500/20 text-red-400 border-red-500/30";
    case MilestoneStatus.Skipped:  return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function msIcon(s: MilestoneStatus) {
  switch (s) {
    case MilestoneStatus.Pending:  return <Hourglass className="h-3.5 w-3.5" />;
    case MilestoneStatus.Voting:   return <Vote className="h-3.5 w-3.5" />;
    case MilestoneStatus.Approved: return <CheckCircle2 className="h-3.5 w-3.5" />;
    case MilestoneStatus.Rejected: return <XCircle className="h-3.5 w-3.5" />;
    case MilestoneStatus.Skipped:  return <ChevronRight className="h-3.5 w-3.5" />;
  }
}

function projectStatusLabel(s: number | undefined) {
  if (s === ProjectStatus.Completed) return "Completed";
  if (s === ProjectStatus.Cancelled) return "Cancelled";
  return "Active";
}

function projectStatusColor(s: number | undefined) {
  if (s === ProjectStatus.Completed) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (s === ProjectStatus.Cancelled) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-blue-500/20 text-blue-400 border-blue-500/30";
}

// ─── Milestone Timeline Card ──────────────────────────────────────────────────
function MilestoneTimeline({
  milestones,
  currentIdx,
  myDonation,
  hasVoted,
  onVote,
  voteState,
}: {
  milestones: Milestone[];
  currentIdx: number;
  myDonation?: bigint;
  hasVoted?: boolean;
  onVote?: (approve: boolean) => void;
  voteState?: "idle" | "pending" | "confirming" | "success" | "error";
}) {
  const isDonor = (myDonation ?? 0n) > 0n;

  return (
    <div className="space-y-3">
      {milestones.map((ms, i) => {
        const isCurrentActive = i === currentIdx;
        const progressPct = ms.goal > 0n
          ? Math.min(100, Number((ms.raised * 10000n) / ms.goal) / 100)
          : 0;
        const isVoting = ms.status === MilestoneStatus.Voting;
        const canVoteHere = isVoting && isDonor && !hasVoted && isCurrentActive;
        // Determine proof type for rendering
        const isImageProof = ms.proofUri?.startsWith("data:image/") || /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(ms.proofUri ?? "");
        const isPdfProof = ms.proofUri?.startsWith("data:application/pdf") || /\.pdf(\?.*)?$/i.test(ms.proofUri ?? "");

        return (
          <div
            key={i}
            className={`rounded-2xl border p-5 transition-all ${
              isCurrentActive
                ? "border-blue-500/30 bg-blue-500/5"
                : ms.status === MilestoneStatus.Approved
                  ? "border-green-500/20 bg-green-500/5"
                  : ms.status === MilestoneStatus.Rejected
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-white/5 bg-white/[0.02] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                  isCurrentActive ? "bg-blue-500 text-white" :
                  ms.status === MilestoneStatus.Approved ? "bg-green-500 text-white" :
                  ms.status === MilestoneStatus.Rejected ? "bg-red-500 text-white" :
                  "bg-white/10 text-white/40"
                }`}>{i + 1}</span>
                <span className="font-bold text-sm text-white/90">{ms.title}</span>
              </div>
              <Badge variant="outline" className={`${msColor(ms.status)} text-[9px] font-black uppercase tracking-widest flex items-center gap-1`}>
                {msIcon(ms.status)} {msLabel(ms.status)}
              </Badge>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatDkt(ms.raised)} raised</span>
                <span>Goal: {formatDkt(ms.goal)}</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3 text-amber-400" />
              <span className={isExpired(ms.deadline) && ms.status === MilestoneStatus.Pending ? "text-red-400 font-semibold" : ""}>
                {isExpired(ms.deadline) ? "Expired " : "Due "}{formatDeadline(ms.deadline)}
              </span>
            </div>

            {/* Proof display — prominent when voting is open */}
            {ms.proofUri && (
              <div className={`mt-3 rounded-xl border ${isVoting ? "border-amber-500/20 bg-amber-500/5 p-3" : "border-white/5 bg-white/[0.02] p-2"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className={`h-3.5 w-3.5 ${isVoting ? "text-amber-400" : "text-green-400"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isVoting ? "text-amber-400" : "text-muted-foreground"}`}>
                    {isVoting ? "Researcher Proof — Review before voting" : "Submitted Proof"}
                  </span>
                </div>
                {isImageProof ? (
                  <div className="rounded-lg overflow-hidden border border-white/10 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ms.proofUri} alt="proof" className="w-full max-h-48 object-contain bg-black/20" />
                  </div>
                ) : isPdfProof ? (
                  <div className="flex items-center gap-2 text-xs text-blue-400 mb-1">
                    <FileIcon className="h-3.5 w-3.5" />
                    <a href={ms.proofUri} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold">
                      Open PDF Report
                    </a>
                  </div>
                ) : (
                  <a href={ms.proofUri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline break-all line-clamp-2">
                    {ms.proofUri}
                  </a>
                )}
              </div>
            )}

            {/* Vote tally bar */}
            {isVoting && ms.raised > 0n && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="text-green-400 font-semibold">YES {formatDkt(ms.votesYes)}</span>
                  <span className="text-red-400 font-semibold">NO {formatDkt(ms.votesNo)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="h-full bg-green-500/70 transition-all" style={{ width: `${ms.raised > 0n ? Number(ms.votesYes * 100n / ms.raised) : 0}%` }} />
                  <div className="h-full bg-red-500/70 transition-all" style={{ width: `${ms.raised > 0n ? Number(ms.votesNo * 100n / ms.raised) : 0}%` }} />
                </div>
                <p className="text-[9px] text-muted-foreground/50 text-right">{ms.raised > 0n ? Number(ms.votesYes * 100n / ms.raised) : 0}% in favor</p>
              </div>
            )}

            {/* Inline vote buttons for eligible donors */}
            {canVoteHere && onVote && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-widest">Your vote ({formatDkt(myDonation ?? 0n)} weight)</p>
                <div className="grid grid-cols-2 gap-2">
                  <TxButton
                    txState={voteState ?? "idle"}
                    idleLabel="Approve"
                    onClick={() => onVote(true)}
                    className="h-10 rounded-xl font-black uppercase tracking-widest text-xs bg-green-600 hover:bg-green-500 text-white"
                  />
                  <TxButton
                    txState={voteState ?? "idle"}
                    idleLabel="Reject"
                    onClick={() => onVote(false)}
                    variant="outline"
                    className="h-10 rounded-xl font-black uppercase tracking-widest text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                  />
                </div>
              </div>
            )}

            {/* Already voted indicator */}
            {isVoting && isDonor && hasVoted && isCurrentActive && (
              <div className="mt-3 flex items-center gap-2 text-[10px] text-green-400/70">
                <CheckCircle2 className="h-3 w-3" />
                <span className="font-semibold">You have voted on this milestone</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Donor Activity Card ──────────────────────────────────────────────────────
function DonorActivityCard({
  milestones,
  myDonations,
  hasVotedArr,
  currentIdx,
  addr,
  refetch,
}: {
  milestones: Milestone[];
  myDonations: bigint[];
  hasVotedArr: boolean[];
  currentIdx: number;
  addr: `0x${string}`;
  refetch: () => void;
}) {
  // Refund write (per-milestone claimRefund)
  const [refundHash, setRefundHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeRefund, isPending: refundPending } = useWriteContract();
  const { isLoading: refundConfirming, isSuccess: refundSuccess } = useWaitForTransactionReceipt({ hash: refundHash });
  const [refundingIdx, setRefundingIdx] = useState<number | null>(null);

  async function handleRefund(msIdx: number) {
    setRefundingIdx(msIdx);
    try {
      const h = await writeRefund({ address: addr, abi: ResearchProjectAbi, functionName: "claimRefund", args: [BigInt(msIdx)] });
      setRefundHash(h); refetch();
    } finally { setRefundingIdx(null); }
  }

  const activeMilestones = milestones
    .map((ms, i) => ({ ms, i, donated: myDonations[i] ?? 0n, voted: hasVotedArr[i] ?? false }))
    .filter(({ donated }) => donated > 0n);

  if (activeMilestones.length === 0) return null;

  return (
    <Card className="glass-morphism border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
      <CardHeader className="bg-violet-500/10 border-b border-violet-500/10 py-5 px-7">
        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-violet-400 flex items-center gap-2">
          <History className="h-3.5 w-3.5" /> My Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        {activeMilestones.map(({ ms, i, donated, voted }) => {
          const isCurrent = i === currentIdx;
          const canClaimRefund = ms.status === MilestoneStatus.Rejected;
          const statusColor =
            ms.status === MilestoneStatus.Approved ? "text-green-400" :
            ms.status === MilestoneStatus.Rejected  ? "text-red-400" :
            ms.status === MilestoneStatus.Voting    ? "text-amber-400" :
            "text-blue-400";

          return (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                    Milestone {i + 1}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">
                      Current
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                  {msLabel(ms.status)}
                </span>
              </div>

              {/* Milestone title */}
              <p className="text-xs font-semibold text-white/70">{ms.title}</p>

              {/* Donation amount */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">My donation</span>
                <span className="font-black text-violet-400">{formatDkt(donated)}</span>
              </div>

              {/* Vote status */}
              {ms.status === MilestoneStatus.Voting && (
                <div className="flex items-center gap-2 text-[10px]">
                  {voted ? (
                    <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="h-3 w-3" /> Voted</span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400"><AlertCircle className="h-3 w-3" /> Vote pending — check the milestone above</span>
                  )}
                </div>
              )}

              {/* Refund button */}
              {canClaimRefund && (
                <TxButton
                  txState={refundingIdx === i && refundPending ? "pending" : refundingIdx === i && refundConfirming ? "confirming" : refundingIdx === i && refundSuccess ? "success" : "idle"}
                  idleLabel={`Claim ${formatDkt(donated)} Refund`}
                  onClick={() => handleRefund(i)}
                  variant="outline"
                  className="w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-red-500/30 text-red-400 hover:bg-red-500/10 mt-1"
                />
              )}

              {/* Approved — funds already sent directly to researcher */}
              {ms.status === MilestoneStatus.Approved && (
                <p className="text-[10px] text-green-400/70 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Milestone approved — funds sent directly to researcher</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Protocol Action Panel ────────────────────────────────────────────────────
function ActionPanel({
  addr,
  milestone,
  milestoneIdx,
  isResearcher,
  myDonation,
  hasVoted,
  refetch,
}: {
  addr: `0x${string}`;
  milestone: Milestone | undefined;
  milestoneIdx: number;
  isResearcher: boolean;
  myDonation: bigint | undefined;
  hasVoted: boolean | undefined;
  refetch: () => void;
}) {
  const [proofUri, setProofUri] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [proofTab, setProofTab] = useState<"file" | "url">("file");
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Submit Proof
  const [proofHash, setProofHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeProof, isPending: proofPending } = useWriteContract();
  const { isLoading: proofConfirming, isSuccess: proofSuccess } = useWaitForTransactionReceipt({ hash: proofHash });

  // Vote
  const [voteHash, setVoteHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeVote, isPending: votePending } = useWriteContract();
  const { isLoading: voteConfirming, isSuccess: voteSuccess } = useWaitForTransactionReceipt({ hash: voteHash });

  // Finalize
  const [finalizeHash, setFinalizeHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeFinalize, isPending: finalizePending } = useWriteContract();
  const { isLoading: finalizeConfirming, isSuccess: finalizeSuccess } = useWaitForTransactionReceipt({ hash: finalizeHash });

  // Skip
  const [skipHash, setSkipHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeSkip, isPending: skipPending } = useWriteContract();
  const { isLoading: skipConfirming, isSuccess: skipSuccess } = useWaitForTransactionReceipt({ hash: skipHash });

  // Refund
  const [refundHash, setRefundHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeRefund, isPending: refundPending } = useWriteContract();
  const { isLoading: refundConfirming, isSuccess: refundSuccess } = useWaitForTransactionReceipt({ hash: refundHash });

  // Cancel project
  const [cancelHash, setCancelHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeCancel, isPending: cancelPending } = useWriteContract();
  const { isLoading: cancelConfirming, isSuccess: cancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash });

  if (!milestone) return null;

  const deadlinePassed = isExpired(milestone.deadline);
  const hasRaised      = milestone.raised > 0n;
  const isDonor        = (myDonation ?? 0n) > 0n;

  // Researcher: can submit proof when deadline passed, status=Pending, has raised
  const canSubmitProof = isResearcher && deadlinePassed && milestone.status === MilestoneStatus.Pending && hasRaised;
  // Researcher: can skip when deadline passed, status=Pending, no donations
  const canSkip = deadlinePassed && milestone.status === MilestoneStatus.Pending && !hasRaised;
  // Anyone: can force-finalize a voting milestone
  const canForceFinalize = milestone.status === MilestoneStatus.Voting;
  // Donor: can vote when voting is open and hasn't voted yet
  const canVote = isDonor && milestone.status === MilestoneStatus.Voting && !hasVoted;
  // Donor: can claim refund on rejected milestone
  const canRefund = isDonor && milestone.status === MilestoneStatus.Rejected;

  // Researcher: can cancel when project is active
  const canCancel = isResearcher;

  const hasAnyAction = canSubmitProof || canSkip || canForceFinalize || canVote || canRefund || canCancel;
  if (!hasAnyAction) return null;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setProofPreview(dataUri);
      setProofUri(dataUri);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmitProof() {
    const h = await writeProof({ address: addr, abi: ResearchProjectAbi, functionName: "submitProof", args: [proofUri] });
    setProofHash(h); setProofUri(""); setProofFile(null); setProofPreview(""); refetch();
  }

  async function handleVote(approve: boolean) {
    const h = await writeVote({ address: addr, abi: ResearchProjectAbi, functionName: "vote", args: [approve] });
    setVoteHash(h); refetch();
  }

  async function handleForceFinalize() {
    const h = await writeFinalize({ address: addr, abi: ResearchProjectAbi, functionName: "finalizeMilestone" });
    setFinalizeHash(h); refetch();
  }

  async function handleSkip() {
    const h = await writeSkip({ address: addr, abi: ResearchProjectAbi, functionName: "skipMilestone" });
    setSkipHash(h); refetch();
  }

  async function handleRefund() {
    const h = await writeRefund({ address: addr, abi: ResearchProjectAbi, functionName: "claimRefund", args: [BigInt(milestoneIdx)] });
    setRefundHash(h); refetch();
  }

  async function handleCancel() {
    const h = await writeCancel({ address: addr, abi: ResearchProjectAbi, functionName: "cancel" });
    setCancelHash(h); setConfirmCancel(false); refetch();
  }

  return (
    <Card className="glass-morphism border-white/10 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-white/5 border-b border-white/5 py-6 px-8">
        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Protocol Execution Hub</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8">

        {isDonor && (
          <div className="flex items-center justify-between py-4 px-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">Your Contribution</span>
            <span className="font-black text-xl text-blue-400">{formatDkt(myDonation ?? 0n)}</span>
          </div>
        )}

        {/* Submit Proof */}
        {canSubmitProof && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Submit proof of milestone completion. Donors will vote to release funds.</p>

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
              <button
                onClick={() => setProofTab("file")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${proofTab === "file" ? "bg-blue-500/30 text-blue-300" : "text-white/40 hover:text-white/60"}`}
              >
                <Upload className="h-3 w-3" /> Upload File
              </button>
              <button
                onClick={() => setProofTab("url")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${proofTab === "url" ? "bg-blue-500/30 text-blue-300" : "text-white/40 hover:text-white/60"}`}
              >
                <LinkIcon className="h-3 w-3" /> Paste URL
              </button>
            </div>

            {proofTab === "file" ? (
              <div className="space-y-3">
                <label className="block w-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-3 h-28 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-center px-4">
                    {proofFile ? (
                      <>
                        <FileIcon className="h-6 w-6 text-blue-400" />
                        <p className="text-xs font-semibold text-white/80 truncate max-w-full">{proofFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(proofFile.size / 1024).toFixed(1)} KB — click to replace</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-white/20" />
                        <p className="text-xs text-muted-foreground">Click to select PDF or image</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="application/pdf,image/*" className="hidden" onChange={handleFileSelect} />
                </label>
                {proofPreview && proofFile?.type.startsWith("image/") && (
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofPreview} alt="proof preview" className="w-full max-h-40 object-contain bg-black/20" />
                  </div>
                )}
              </div>
            ) : (
              <input
                className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/50"
                placeholder="https://ipfs.io/ipfs/... or any public URL"
                value={proofTab === "url" ? proofUri : ""}
                onChange={e => { setProofUri(e.target.value); setProofFile(null); setProofPreview(""); }}
              />
            )}

            <TxButton
              txState={proofPending ? "pending" : proofConfirming ? "confirming" : proofSuccess ? "success" : "idle"}
              idleLabel="Submit Proof"
              disabled={!proofUri}
              onClick={handleSubmitProof}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest"
            />
          </div>
        )}

        {/* Skip empty milestone */}
        {canSkip && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No donations were received for this milestone. Skip to the next one.</p>
            <TxButton
              txState={skipPending ? "pending" : skipConfirming ? "confirming" : skipSuccess ? "success" : "idle"}
              idleLabel="Skip Milestone"
              onClick={handleSkip}
              variant="outline"
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest border-white/10"
            />
          </div>
        )}

        {/* Vote */}
        {canVote && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review the researcher&apos;s proof and vote to approve or reject this milestone.
              {milestone.proofUri && <a href={milestone.proofUri} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">View Proof</a>}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <TxButton
                txState={votePending ? "pending" : voteConfirming ? "confirming" : voteSuccess ? "success" : "idle"}
                idleLabel="Approve"
                onClick={() => handleVote(true)}
                className="h-12 rounded-2xl font-black uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white"
              />
              <TxButton
                txState={votePending ? "pending" : voteConfirming ? "confirming" : voteSuccess ? "success" : "idle"}
                idleLabel="Reject"
                onClick={() => handleVote(false)}
                variant="outline"
                className="h-12 rounded-2xl font-black uppercase tracking-widest border-red-500/30 text-red-400 hover:bg-red-500/10"
              />
            </div>
          </div>
        )}

        {/* Force finalize */}
        {canForceFinalize && !canVote && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Force-finalize based on current votes. Whichever side has more DKT weight wins.</p>
            <TxButton
              txState={finalizePending ? "pending" : finalizeConfirming ? "confirming" : finalizeSuccess ? "success" : "idle"}
              idleLabel="Force Finalize Vote"
              onClick={handleForceFinalize}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest"
            />
          </div>
        )}

        {/* Refund */}
        {canRefund && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Milestone was rejected. Claim your DKT refund of <span className="text-blue-400 font-black">{formatDkt(myDonation ?? 0n)}</span>.
            </p>
            <TxButton
              txState={refundPending ? "pending" : refundConfirming ? "confirming" : refundSuccess ? "success" : "idle"}
              idleLabel="Claim Refund"
              onClick={handleRefund}
              variant="outline"
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest border-white/10"
            />
          </div>
        )}

        {/* Cancel project — researcher only, shown at the bottom as a danger action */}
        {canCancel && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full h-10 rounded-2xl text-xs font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 transition-all"
              >
                Cancel Project
              </button>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 font-semibold">
                  This will cancel the project. The current milestone will be marked as Rejected and donors can claim refunds. This action is irreversible.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <TxButton
                    txState={cancelPending ? "pending" : cancelConfirming ? "confirming" : cancelSuccess ? "success" : "idle"}
                    idleLabel="Confirm Cancel"
                    onClick={handleCancel}
                    className="h-10 rounded-2xl font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white text-xs"
                  />
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="h-10 rounded-2xl text-xs font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                  >
                    Keep Active
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectDetailPage({ params }: Props) {
  const { address: projectAddress } = use(params);
  const addr = projectAddress as `0x${string}`;
  const { address: userAddress, isConnected } = useAccount();

  const {
    title, researcher, projectStatus, currentMilestoneIndex,
    milestoneCount, totalRaised, totalDisbursed, yieldReceived, milestones,
    myCurrentDonation, myDonationsPerMilestone, hasVoted, hasVotedPerMilestone,
    isLoading, refetch,
  } = useProject(addr);

  // Inline vote state for the MilestoneTimeline (donor flow)
  const [inlineVoteHash, setInlineVoteHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync: writeInlineVote, isPending: inlineVotePending } = useWriteContract();
  const { isLoading: inlineVoteConfirming, isSuccess: inlineVoteSuccess } = useWaitForTransactionReceipt({ hash: inlineVoteHash });

  async function handleInlineVote(approve: boolean) {
    try {
      const h = await writeInlineVote({ address: addr, abi: ResearchProjectAbi, functionName: "vote", args: [approve] });
      setInlineVoteHash(h);
      refetch();
    } catch { /* surfaced via txState */ }
  }

  const inlineVoteState: "idle" | "pending" | "confirming" | "success" =
    inlineVotePending ? "pending" : inlineVoteConfirming ? "confirming" : inlineVoteSuccess ? "success" : "idle";

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <ParallaxBackground />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-14 w-2/3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
          <div className="lg:col-span-2"><Skeleton className="h-[500px] w-full rounded-[2.5rem]" /></div>
          <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  const isResearcher = !!(userAddress && researcher && userAddress.toLowerCase() === researcher.toLowerCase());
  const currentMs = milestones[currentMilestoneIndex];
  const isProjectActive = projectStatus === ProjectStatus.Active;

  // Goal reached: current milestone is Pending, not expired, but raised >= goal
  const goalMet = !!(currentMs && currentMs.goal > 0n && currentMs.raised >= currentMs.goal && currentMs.status === MilestoneStatus.Pending);
  const nextMs = milestones[currentMilestoneIndex + 1];

  // Donor activity: does this user have any donation across all milestones?
  const isDonorOnProject = myDonationsPerMilestone?.some(d => d > 0n) ?? false;

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative">
        {/* Header */}
        <FadeIn>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-400 transition-colors group mb-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Project Registry
          </Link>

          <div className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <NetworkBadge />
              <Badge variant="outline" className={`${projectStatusColor(projectStatus)} px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] border-white/5`}>
                {projectStatusLabel(projectStatus)}
              </Badge>
              {milestoneCount > 0 && (
                <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10 px-4 py-1.5 rounded-full font-black text-[10px]">
                  Milestone {currentMilestoneIndex + 1} / {milestoneCount}
                </Badge>
              )}
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {title ?? "Loading Research Project..."}
            </h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="font-mono text-[10px] text-white/40 bg-white/5 inline-block px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest font-black">
                {addr.slice(0, 10)}...{addr.slice(-8)}
              </p>
              <ShareButtons title={title ?? "Research Project"} compact />
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats row */}
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl glass-morphism border border-white/5 space-y-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-60 flex items-center gap-1.5"><Wallet className="h-3 w-3 text-blue-400" /> Total Raised</p>
                  <p className="text-2xl font-black text-blue-400">{totalRaised !== undefined ? formatDkt(totalRaised) : "—"}</p>
                </div>
                <div className="p-5 rounded-2xl glass-morphism border border-white/5 space-y-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-60 flex items-center gap-1.5"><Zap className="h-3 w-3 text-yellow-400" /> Yield Received</p>
                  <p className="text-2xl font-black text-yellow-400">{yieldReceived !== undefined ? formatDkt(yieldReceived) : "—"}</p>
                </div>
                <div className="p-5 rounded-2xl glass-morphism border border-white/5 space-y-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-60 flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-green-400" /> Disbursed</p>
                  <p className="text-2xl font-black text-green-400">{totalDisbursed !== undefined ? formatDkt(totalDisbursed) : "—"}</p>
                </div>
                <div className="p-5 rounded-2xl glass-morphism border border-white/5 space-y-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-60 flex items-center gap-1.5"><User className="h-3 w-3 text-violet-400" /> Researcher</p>
                  <p className="font-mono text-xs font-black text-white/70">{researcher ? shortenAddress(researcher, 5) : "—"}</p>
                </div>
              </div>
            </FadeIn>

            {/* Milestone timeline */}
            <FadeIn delay={0.15}>
              <Card className="glass-morphism border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/5 border-b border-white/5 py-6 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Research Milestones</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {milestones.length > 0
                    ? <MilestoneTimeline
                        milestones={milestones}
                        currentIdx={currentMilestoneIndex}
                        myDonation={myCurrentDonation}
                        hasVoted={hasVoted}
                        onVote={isConnected ? handleInlineVote : undefined}
                        voteState={inlineVoteState}
                      />
                    : <p className="text-muted-foreground text-sm text-center py-8">No milestones loaded.</p>
                  }
                </CardContent>
              </Card>
            </FadeIn>

            {/* Action panel */}
            {isConnected && isProjectActive && (
              <FadeIn delay={0.2}>
                <ActionPanel
                  addr={addr}
                  milestone={currentMs}
                  milestoneIdx={currentMilestoneIndex}
                  isResearcher={isResearcher}
                  myDonation={myCurrentDonation}
                  hasVoted={hasVoted}
                  refetch={refetch}
                />
              </FadeIn>
            )}

            {/* Project Updates */}
            <FadeIn delay={0.25}>
              <ProjectUpdates
                projectAddress={addr}
                researcherAddress={researcher ?? "0x0"}
              />
            </FadeIn>
          </div>

          {/* Right column — Donate + activity + metadata */}
          <div className="space-y-6">
            <FadeIn delay={0.25}>
              {isProjectActive && currentMs?.status === MilestoneStatus.Pending && !isExpired(currentMs.deadline) ? (
                goalMet ? (
                  /* Goal reached — preview next milestone */
                  <Card className="glass-morphism border-green-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-green-500/10 border-b border-green-500/10 py-6 px-7">
                      <CardTitle className="text-lg font-black tracking-tight flex items-center gap-3 text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Milestone {currentMilestoneIndex + 1} Goal Reached!
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentMs.title} — <span className="text-green-400 font-semibold">{formatDkt(currentMs.raised)} DKT</span> raised
                      </p>
                    </CardHeader>
                    <CardContent className="p-7 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        The funding goal is met. This milestone is still active until its deadline, then the researcher submits proof and donors vote to release funds.
                      </p>
                      {nextMs && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Up Next — Milestone {currentMilestoneIndex + 2}</p>
                          <p className="text-sm font-bold text-white/80">{nextMs.title}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Goal</span>
                            <span className="text-blue-400 font-semibold">{formatDkt(nextMs.goal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Opens after</span>
                            <span>{formatDeadline(currentMs.deadline)}</span>
                          </div>
                        </div>
                      )}
                      {!nextMs && (
                        <p className="text-xs text-muted-foreground text-center py-2 opacity-60">This is the final milestone.</p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  /* Normal donate card */
                  <Card className="glass-morphism border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-blue-500/10 border-b border-blue-500/10 py-6 px-7">
                      <CardTitle className="text-lg font-black tracking-tight flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        Fund Milestone {currentMilestoneIndex + 1}
                      </CardTitle>
                      {currentMs && (
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{currentMs.title}</p>
                      )}
                    </CardHeader>
                    <CardContent className="p-7">
                      <DonateForm
                        projectAddress={addr}
                        status={projectStatus ?? ProjectStatus.Active}
                        goal={currentMs?.goal}
                        raised={currentMs?.raised}
                        onSuccess={refetch}
                      />
                    </CardContent>
                  </Card>
                )
              ) : (
                <div className="p-6 rounded-[2rem] glass-morphism border border-white/5 text-center space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">
                    {!isProjectActive ? "Project closed" : "Donations paused"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentMs?.status === MilestoneStatus.Voting
                      ? "Awaiting donor vote on current milestone."
                      : currentMs?.status === MilestoneStatus.Rejected
                        ? "Current milestone rejected. Awaiting researcher action."
                        : "No active milestone accepting donations."}
                  </p>
                </div>
              )}
            </FadeIn>

            {/* My Activity — donor view */}
            {isConnected && isDonorOnProject && (
              <FadeIn delay={0.32}>
                <DonorActivityCard
                  milestones={milestones}
                  myDonations={myDonationsPerMilestone ?? []}
                  hasVotedArr={hasVotedPerMilestone ?? []}
                  currentIdx={currentMilestoneIndex}
                  addr={addr}
                  refetch={refetch}
                />
              </FadeIn>
            )}

            <FadeIn delay={0.3}>
              <div className="p-7 rounded-[2rem] glass-morphism border border-white/5 text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black space-y-4">
                <div className="flex items-center justify-between">
                  <span>Network</span>
                  <span className="text-white/60">DChain</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Upgrade Standard</span>
                  <span className="text-white/60">Beacon Proxy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vote Mechanism</span>
                  <span className="text-white/60">DKT-weighted</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
