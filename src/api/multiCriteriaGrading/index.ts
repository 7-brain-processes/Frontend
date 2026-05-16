import { deleteGradingConfig } from "./deleteGradingConfig";
import { getCriteriaGrades } from "./getCriteriaGrades";
import { getGradeDecomposition } from "./getGradeDecomposition";
import { getGradingConfig } from "./getGradingConfig";
import { publishCriteriaGrades } from "./publishCriteriaGrades";
import { unpublishCriteriaGrades } from "./unpublishCriteriaGrades";
import { upsertCriteriaGrades } from "./upsertCriteriaGrades";
import { upsertGradingConfig } from "./upsertGradingConfig";

export { deleteGradingConfig } from "./deleteGradingConfig";
export { getCriteriaGrades } from "./getCriteriaGrades";
export { getGradeDecomposition } from "./getGradeDecomposition";
export { getGradingConfig } from "./getGradingConfig";
export { publishCriteriaGrades } from "./publishCriteriaGrades";
export { unpublishCriteriaGrades } from "./unpublishCriteriaGrades";
export { upsertCriteriaGrades } from "./upsertCriteriaGrades";
export { upsertGradingConfig } from "./upsertGradingConfig";

export const multiCriteriaGradingService = {
    getGradingConfig,
    upsertGradingConfig,
    deleteGradingConfig,
    getCriteriaGrades,
    publishCriteriaGrades,
    unpublishCriteriaGrades,
    getGradeDecomposition,
    upsertCriteriaGrades
};