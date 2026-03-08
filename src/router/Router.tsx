import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import AuthPage from "../pages/Auth/AuthPage";
import RegistrationPage from "../pages/Registration/RegistrationPage";
import MainPage from "../pages/Main/MainPage";
import CourseDetailPage from "../pages/CourseDetail/CourseDetailPage";
//import CoursesPage from "../components/CoursesPage";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { Course } from "../components/CourseCard";
import { mockCourses } from "../data/mockData";

const Router = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const courses: Course[] = [
        {
            id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
            name: 'Тест',
            description: 'Тест',
            createdAt: '2025-09-02T14:00:00Z',
            currentUserRole: 'STUDENT',
            teacherCount: 1,
            studentCount: 42
        },
        {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'Тест',
            description: 'Тест',
            createdAt: '2025-09-02T14:00:00Z',
            currentUserRole: 'STUDENT',
            teacherCount: 1,
            studentCount: 42
        },
        {
            id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            name: 'Тест',
            description: 'Тест',
            createdAt: '2025-09-02T14:00:00Z',
            currentUserRole: 'STUDENT',
            teacherCount: 1,
            studentCount: 42
        },
        {
            id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
            name: 'Тест',
            description: 'Тест',
            createdAt: '2025-09-02T14:00:00Z',
            currentUserRole: 'STUDENT',
            teacherCount: 1,
            studentCount: 42
        },
    ];

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
        console.log('Course clicked:', courseId);
    };

    return (
        <div>
            {location.pathname !== '/login' && location.pathname !== '/' && location.pathname !== '/registration' && !localStorage.getItem('token') &&
                <>
                    <Header onMenuClick={handleMenuClick} />
                    <Sidebar
                        isOpen={sidebarOpen}
                        isCollapsed={sidebarCollapsed}
                        onClose={handleSidebarClose}
                        courses={mockCourses}
                        onCourseClick={handleCourseClick}
                    />
                </>}
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/course/:id" element={<CourseDetailPage />} />
            </Routes>
        </div>
    )
}

export default Router;