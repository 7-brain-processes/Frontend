import { apiAuth } from "../api"

export const leaveCourse = async (courseId: string | undefined): Promise<any> => {
    try {
        const response = await apiAuth.post(`/api/v1/courses/${courseId}/leave`, {});
        return response.data;
    }
    catch (error: any) {
        if (error.response) {
            const { status, data } = error.response;
            throw new Error(`Ошибка при покидании курса(${status}): ${JSON.stringify(data)}`);
        }
        throw new Error(error.message);
    }
}