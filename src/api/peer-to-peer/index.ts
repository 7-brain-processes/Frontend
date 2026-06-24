import { applyGrades } from "./applyGrades";
import { closeRound1 } from "./closeRound1";
import { closeRound2 } from "./closeRound2";
import { distributeRound2 } from "./distributeRound2";
import { distributeRound1 } from "./distributeRound1";
import { getConfig } from "./getConfig";
import { getMyAssignments } from "./getMyAssignments";
import { getUnderReviewed } from "./getUnderReviewed";
import { submitPeerReview } from "./submitPeerReview";

export { applyGrades } from "./applyGrades";
export { closeRound1 } from "./closeRound1";
export { closeRound2 } from "./closeRound2";
export { distributeRound2 } from "./distributeRound2";
export { distributeRound1 } from "./distributeRound1";
export { getConfig } from "./getConfig";
export { getMyAssignments } from "./getMyAssignments";
export { getUnderReviewed } from "./getUnderReviewed";
export { submitPeerReview } from "./submitPeerReview";

export const peer2peerService = {
    applyGrades,
    closeRound1,
    closeRound2,
    distributeRound2,
    getConfig,
    getMyAssignments,
    getUnderReviewed,
    submitPeerReview,
    distributeRound1
};
