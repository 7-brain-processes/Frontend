import SubmitButton from "../../components/SubmitButton";
import { useCourseDetailPage } from "./hooks/useCourseDetailPage";

const CourseDetailPage = () => {
    const { state, functions } = useCourseDetailPage();

    return (
        <div>
            <SubmitButton id="leave-button" text="Покинуть курс" colorScheme="primary" onClick={functions.leaveCourses} />

        </div>
    );
};

export default CourseDetailPage;