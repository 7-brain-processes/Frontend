import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import AuthPage from "../pages/Auth/AuthPage";
import RegistrationPage from "../pages/Registration/RegistrationPage";
import MainPage from "../pages/Main/MainPage";
import CourseDetailPage from "../pages/CourseDetail/CourseDetailPage";
import TaskDetailPage from "../pages/TaskDetail/TaskDetailPage";
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
            {location.pathname !== '/login' && location.pathname !== '/' && location.pathname !== '/registration' && localStorage.getItem('token') &&
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
                <Route path="/main" element={<MainPage />} />
                <Route path="/course/:id" element={<CourseDetailPage />} />
                <Route path="/course/:courseId/task/:taskId" element={<TaskDetailPage />} />
            </Routes>
        </div>
    )
}

export default Router;