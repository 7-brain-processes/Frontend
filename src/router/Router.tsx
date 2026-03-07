import { Route, Routes } from "react-router-dom"
import AuthPage from "../pages/Auth/AuthPage";
import RegistrationPage from "../pages/Registration/RegistrationPage";
import MainPage from "../pages/Main/MainPage";
import CourseDetailPage from "../pages/CourseDetail/CourseDetailPage";

const Router = () => {
    return (
        <div>
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