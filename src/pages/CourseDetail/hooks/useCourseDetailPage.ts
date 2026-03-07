import { useParams } from "react-router-dom";
import { leaveCourse } from "../../../api/courses/leaveCourse";

export const useCourseDetailPage = () => {
    const { id } = useParams();

    const leaveCourses = async () => {

        try {
            await leaveCourse(id);
        }
        catch (error: any) {
            console.error(error.message);
            alert(`Ошибка: ${error.message}`);
        }
    }

    return {
        state: {},
        functions: {
            leaveCourses
        }
    }
}