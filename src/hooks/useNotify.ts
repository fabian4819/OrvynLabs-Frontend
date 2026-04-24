import { useNotifications } from "@/contexts/NotificationContext";
import { useCallback } from "react";

/**
 * Convenience hook for common notification patterns
 */
export function useNotify() {
  const { addNotification } = useNotifications();

  const notifyDonationReceived = useCallback(
    (amount: string, donor: string, projectAddress: string) => {
      addNotification({
        type: "donation_received",
        title: "New Donation Received!",
        message: `Received ${amount} DKT from ${donor}`,
        link: `/projects/${projectAddress}`,
      });
    },
    [addNotification]
  );

  const notifyMilestoneApproved = useCallback(
    (milestoneName: string, projectAddress: string) => {
      addNotification({
        type: "milestone_approved",
        title: "Milestone Approved!",
        message: `"${milestoneName}" has been approved by donors`,
        link: `/projects/${projectAddress}`,
      });
    },
    [addNotification]
  );

  const notifyMilestoneRejected = useCallback(
    (milestoneName: string, projectAddress: string) => {
      addNotification({
        type: "milestone_rejected",
        title: "Milestone Rejected",
        message: `"${milestoneName}" was rejected by donors`,
        link: `/projects/${projectAddress}`,
      });
    },
    [addNotification]
  );

  const notifyProjectFunded = useCallback(
    (projectName: string, projectAddress: string) => {
      addNotification({
        type: "project_funded",
        title: "Project Fully Funded!",
        message: `"${projectName}" has reached its funding goal!`,
        link: `/projects/${projectAddress}`,
      });
    },
    [addNotification]
  );

  const notifyYieldClaimed = useCallback((amount: string) => {
    addNotification({
      type: "yield_claimed",
      title: "Yield Claimed",
      message: `Successfully claimed ${amount} DKT yield`,
      link: "/stake",
    });
  }, [addNotification]);

  const notifyVoteCast = useCallback(
    (projectName: string, projectAddress: string, approved: boolean) => {
      addNotification({
        type: "vote_cast",
        title: "Vote Recorded",
        message: `Your ${approved ? "approval" : "rejection"} vote for "${projectName}" has been recorded`,
        link: `/projects/${projectAddress}`,
      });
    },
    [addNotification]
  );

  const notifyProjectCreated = useCallback(
    (projectName: string, projectAddress: string) => {
      addNotification({
        type: "project_created",
        title: "Project Created!",
        message: `"${projectName}" has been deployed on-chain`,
        link: `/projects/${projectAddress}`,
      });
    },
    [addNotification]
  );

  const notifyStakeSuccess = useCallback((amount: string) => {
    addNotification({
      type: "stake_success",
      title: "Stake Successful",
      message: `Staked ${amount} DKT successfully`,
      link: "/stake",
    });
  }, [addNotification]);

  const notifyUnstakeSuccess = useCallback((amount: string) => {
    addNotification({
      type: "unstake_success",
      title: "Unstake Successful",
      message: `Unstaked ${amount} DKT successfully`,
      link: "/stake",
    });
  }, [addNotification]);

  return {
    notifyDonationReceived,
    notifyMilestoneApproved,
    notifyMilestoneRejected,
    notifyProjectFunded,
    notifyYieldClaimed,
    notifyVoteCast,
    notifyProjectCreated,
    notifyStakeSuccess,
    notifyUnstakeSuccess,
    // Also expose the raw addNotification for custom notifications
    addNotification,
  };
}
