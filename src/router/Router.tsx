import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import AuthPage from "../pages/Auth/AuthPage";
import RegistrationPage from "../pages/Registration/RegistrationPage";
import MainPage from "../pages/Main/MainPage";
import CourseDetailPage from "../pages/CourseDetail/CourseDetailPage";
import TaskDetailPage from "../pages/TaskDetail/TaskDetailPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import AssignmentsListPage from "../pages/AssignmentsList/AssignmentsListPage";
//import CoursesPage from "../components/CoursesPage";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { CourseDto } from "../types/api";
import { coursesService } from "../api/services";

const Router = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const hideNavigation = !['/', '/login', '/registration', '/main', '/assignments'].includes(location.pathname)
        && !location.pathname.startsWith('/course/');
    const shouldShowNavigation = !hideNavigation
        && location.pathname !== '/login'
        && location.pathname !== '/'
        && location.pathname !== '/registration'
        && localStorage.getItem('token');

    useEffect(() => {
        if (localStorage.getItem('token')) {
            loadCourses();
        }
    }, [location.pathname]);

    const loadCourses = async () => {
        try {
            const response = await coursesService.listMyCourses();
            setCourses(response.content);
        } catch (err: any) {
            console.error('Failed to load courses in Router:', err);
            setCourses([]);
        }
    };

    const handleMenuClick = () => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const handleSidebarClose = () => {
        setSidebarOpen(false);
    };

    const handleCourseClick = (courseId: string) => {
        navigate(`/course/${courseId}`);
        handleSidebarClose();
    };

    return (
        <div>
            {shouldShowNavigation &&
                <>
                    <Header onMenuClick={handleMenuClick} />
                    <Sidebar
                        isOpen={sidebarOpen}
                        isCollapsed={sidebarCollapsed}
                        onClose={handleSidebarClose}
                        courses={courses}
                        onCourseClick={handleCourseClick}
                    />
                </>}
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/assignments" element={<AssignmentsListPage />} />
                <Route path="/course/:id" element={<CourseDetailPage />} />
                <Route path="/course/:courseId/task/:taskId" element={<TaskDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    )
}

export default Router;
