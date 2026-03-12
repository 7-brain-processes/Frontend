import CourseCard from '../../components/CourseCard';
import CreateCourseDialog from "../CreateCourse/CreateCourseDialog";
import JoinToCourseDialog from "../JoinToCourse/JoinToCourseDialog";
import { useMainPage } from './hooks/useMainPage';
import './MainPage.css';

const MainPage = () => {
    const { state, functions } = useMainPage();

    return (
        <div className="courses-page" data-testid="main-page">
            <main className={`courses-main ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="courses-container">
                    <div className="courses-header">
                        <h1>Мои курсы</h1>
                        <div className="courses-header-buttons">
                            <button className="create-course-btn" onClick={() => functions.handleIsOpenNewCourse(true)}>
                                + Создать
                            </button>
                            <button className="join-course-btn" onClick={() => functions.handleIsOpenJoinCourse(true)}>
                                Присоединиться
                            </button>
                        </div>
                    </div>

                    {state.loading && <div className="loading">Загрузка курсов...</div>}
                    {state.error && <div className="error">{state.error}</div>}

                    {!state.loading && state.courses.length === 0 && (
                        <div className="empty-state">
                            <p>У вас пока нет курсов</p>
                            <button onClick={() => functions.handleIsOpenNewCourse(true)}>Создать первый курс</button>
                        </div>
                    )}

                    {!state.loading && state.courses.length > 0 && (
                        <div className="courses-grid" data-testid="courses-list">
                            {state.courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onClick={() => functions.handleCourseClick(course.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <CreateCourseDialog
                isOpenNewCourse={state.isOpenNewCourse}
                handleIsOpenNewCourse={functions.handleIsOpenNewCourse}
                handleChangeCreateCourse={functions.handleChangeCreateCourse}
                errorsCreateCourseForm={state.errorsCreateCourseForm}
                createCourseForm={state.createCourseForm}
                createNewCourse={functions.createNewCourse}
            />
            <JoinToCourseDialog
                isOpenJoinCourse={state.isOpenJoinCourse}
                handleIsOpenJoinCourse={functions.handleIsOpenJoinCourse}
                handleChangeJoinCourse={functions.handleChangeJoinCourse}
                errorsJoinToCourseForm={state.errorsJoinToCourseForm}
                joinToCourseForm={state.joinToCourseForm}
                joinToCourse={functions.joinToCourse}
            />
        </div>
    );
};

export default MainPage;