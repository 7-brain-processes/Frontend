import SubmitButton from "../../components/SubmitButton";
import CreateCourseDialog from "../CreateCourse/CreateCourseDialog";
import JoinToCourseDialog from "../JoinToCourse/JoinToCourseDialog";
import { useMainPage } from "./hooks/useMainPage";

const MainPage = () => {
    const { state, functions } = useMainPage();

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '36px',
            paddingRight: '240px',
            paddingLeft: '240px',
            position: 'relative',
            top: 125,
            flexDirection: 'column'
        }}>
            <span>+</span>
            <SubmitButton text="Создать" colorScheme="primary" onClick={() => functions.handleIsOpenNewCourse(true)} />
            <CreateCourseDialog isOpenNewCourse={state.isOpenNewCourse} handleIsOpenNewCourse={functions.handleIsOpenNewCourse}
                handleChangeCreateCourse={functions.handleChangeCreateCourse} errorsCreateCourseForm={state.errorsCreateCourseForm}
                createCourseForm={state.createCourseForm} createNewCourse={functions.createNewCourse} />
            <SubmitButton text="Присоединиться" colorScheme="primary" onClick={() => functions.handleIsOpenJoinCourse(true)} />
            <JoinToCourseDialog isOpenJoinCourse={state.isOpenJoinCourse} handleIsOpenJoinCourse={functions.handleIsOpenJoinCourse}
                handleChangeJoinCourse={functions.handleChangeJoinCourse} errorsJoinToCourseForm={state.errorsJoinToCourseForm}
                joinToCourseForm={state.joinToCourseForm} joinToCourse={functions.joinToCourse} />
        </div>
    );
};

export default MainPage;