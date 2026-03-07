import { JoinToCourse } from "../../types/JoinToCourse";
import { apiAuth } from "../api"

export const joinCourse = async (joinToCourseForm: JoinToCourse): Promise<any> => {
    try {
        const response = await apiAuth.post(`/api/v1/invites/${joinToCourseForm.code}/join`, {});
        return response.data;
    }
    catch (error: any) {
        if (error.response) {
            const { status, data } = error.response;
            throw new Error(`Ошибка при присоединении к курсу (${status}): ${JSON.stringify(data)}`);
        }
        throw new Error(error.message);
    }
}