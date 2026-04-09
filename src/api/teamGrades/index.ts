import { getDistribution } from "./getDistribution";
import { getGrade } from "./getGrade";
import { setDistributionMode } from "./setDistributionMode";
import { upsertGrade } from "./upsertGrade";

export { getDistribution } from "./getDistribution";
export { getGrade } from "./getGrade";
export { setDistributionMode } from "./setDistributionMode";
export { upsertGrade } from "./upsertGrade";

export const teamGradesService = {
    getGrade,
    upsertGrade,
    setDistributionMode,
    getDistribution
};