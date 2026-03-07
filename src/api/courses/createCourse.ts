import { CreateCourse } from "../../types/CreateCourse";
import { apiAuth } from "../api"

export const createCourse = async (createCourseForm: CreateCourse): Promise<any> => {
    try {
        const response = await apiAuth.post('/api/v1/courses', createCourseForm);
        return response.data;
    }
    catch (error: any) {
        if (error.response) {
            const { status, data } = error.response;
            throw new Error(`Ошибка при создании курса (${status}): ${JSON.stringify(data)}`);
        }
        throw new Error(error.message);
    }
}