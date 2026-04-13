import { getDistribution } from "./getDistribution";
import { getDistributionForm } from "./getDistributionForm";
import { getGrade } from "./getGrade";
import { saveDistribution } from "./saveDistribution";
import { setDistributionMode } from "./setDistributionMode";
import { upsertGrade } from "./upsertGrade";

export { getDistribution } from "./getDistribution";
export { getGrade } from "./getGrade";
export { setDistributionMode } from "./setDistributionMode";
export { upsertGrade } from "./upsertGrade";
export { getDistributionForm } from "./getDistributionForm";
export { saveDistribution } from "./saveDistribution";

export const teamGradesService = {
    getGrade,
    upsertGrade,
    setDistributionMode,
    getDistribution,
    getDistributionForm,
    saveDistribution
};