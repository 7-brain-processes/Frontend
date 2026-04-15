import { getDistribution } from "./getDistribution";
import { getMyTeamGrade } from "./getMyTeamGrade";
import { getDistributionForm } from "./getDistributionForm";
import { getGrade } from "./getGrade";
import { getGradeVote } from "./getGradeVote";
import { saveDistribution } from "./saveDistribution";
import { setDistributionMode } from "./setDistributionMode";
import { submitGradeVote } from "./submitGradeVote";
import { upsertGrade } from "./upsertGrade";

export { getDistribution } from "./getDistribution";
export { getMyTeamGrade } from "./getMyTeamGrade";
export { getGrade } from "./getGrade";
export { getGradeVote } from "./getGradeVote";
export { setDistributionMode } from "./setDistributionMode";
export { upsertGrade } from "./upsertGrade";
export { getDistributionForm } from "./getDistributionForm";
export { saveDistribution } from "./saveDistribution";
export { submitGradeVote } from "./submitGradeVote";

export const teamGradesService = {
    getGrade,
    getMyTeamGrade,
    upsertGrade,
    setDistributionMode,
    getDistribution,
    getDistributionForm,
    saveDistribution,
    getGradeVote,
    submitGradeVote
};
