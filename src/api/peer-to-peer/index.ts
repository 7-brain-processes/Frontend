import { distributeRound1 } from "./distributeRound1";
import { getMyAssignments } from "./getMyAssignments";
import { submitPeerReview } from "./submitPeerReview";

export { distributeRound1 } from "./distributeRound1";
export { getMyAssignments } from "./getMyAssignments";
export { submitPeerReview } from "./submitPeerReview";

export const peer2peerService = {
    getMyAssignments,
    submitPeerReview,
    distributeRound1
};