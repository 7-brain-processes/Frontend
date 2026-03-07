import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CourseCard from '../../components/CourseCard';
import CreateCourseDialog from "../CreateCourse/CreateCourseDialog";
import JoinToCourseDialog from "../JoinToCourse/JoinToCourseDialog";
import { useMainPage } from './hooks/useMainPage';
import './MainPage.css';

const MainPage = () => {
    const { state, functions } = useMainPage();
    const {
        sidebarOpen,
        sidebarCollapsed,
        courses,
        loading,
        error,
        createCourseForm,
        joinToCourseForm,
        errorsCreateCourseForm,
        errorsJoinToCourseForm,
        isOpenNewCourse,
        isOpenJoinCourse
    } = state;

    const {
        handleMenuClick,
        handleSidebarClose,
        handleCourseClick,
        handleIsOpenNewCourse,
        handleIsOpenJoinCourse,
        handleChangeCreateCourse,
        handleChangeJoinCourse,
        createNewCourse,
        joinToCourse
    } = functions;

    return (
        <div className="courses-page" data-testid="main-page">
            <Header onMenuClick={handleMenuClick} />
            <Sidebar 
                isOpen={sidebarOpen} 
                isCollapsed={sidebarCollapsed} 
                onClose={handleSidebarClose}
                courses={courses}
                onCourseClick={handleCourseClick}
            />
            <main className={`courses-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="courses-container">
                    <div className="courses-header">
                        <h1>Мои курсы</h1>
                        <div className="courses-header-buttons">
                            <button className="create-course-btn" onClick={() => handleIsOpenNewCourse(true)}>
                                + Создать
                            </button>
                            <button className="join-course-btn" onClick={() => handleIsOpenJoinCourse(true)}>
                                Присоединиться
                            </button>
                        </div>
                    </div>

                    {loading && <div className="loading">Загрузка курсов...</div>}
                    {error && <div className="error">{error}</div>}

                    {!loading && courses.length === 0 && (
                        <div className="empty-state">
                            <p>У вас пока нет курсов</p>
                            <button onClick={() => handleIsOpenNewCourse(true)}>Создать первый курс</button>
                        </div>
                    )}

                    {!loading && courses.length > 0 && (
                        <div className="courses-grid" data-testid="courses-list">
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onClick={() => handleCourseClick(course.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <CreateCourseDialog 
                isOpenNewCourse={isOpenNewCourse} 
                handleIsOpenNewCourse={handleIsOpenNewCourse}
                handleChangeCreateCourse={handleChangeCreateCourse} 
                errorsCreateCourseForm={errorsCreateCourseForm}
                createCourseForm={createCourseForm} 
                createNewCourse={createNewCourse} 
            />
            <JoinToCourseDialog 
                isOpenJoinCourse={isOpenJoinCourse} 
                handleIsOpenJoinCourse={handleIsOpenJoinCourse}
                handleChangeJoinCourse={handleChangeJoinCourse} 
                errorsJoinToCourseForm={errorsJoinToCourseForm}
                joinToCourseForm={joinToCourseForm} 
                joinToCourse={joinToCourse} 
            />
        </div>
    );
};

export default MainPage;