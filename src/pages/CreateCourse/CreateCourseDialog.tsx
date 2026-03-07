import { Dialog, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import InputForm from "../../components/InputForm";
import SubmitButton from "../../components/SubmitButton";
import { CreateCourse } from "../../types/CreateCourse";

interface CreateCourseDialogProps {
    isOpenNewCourse: boolean;
    handleIsOpenNewCourse: (isOpen: boolean) => void;
    handleChangeCreateCourse: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorsCreateCourseForm: Partial<Record<keyof CreateCourse, string>>;
    createCourseForm: CreateCourse;
    createNewCourse: () => void;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ isOpenNewCourse, handleIsOpenNewCourse, handleChangeCreateCourse, errorsCreateCourseForm, createCourseForm, createNewCourse }) => {
    return (
        <Dialog
            open={isOpenNewCourse}
            onClose={() => handleIsOpenNewCourse(false)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '24px',
                    width: '500px',
                    height: 'auto',
                    padding: '40px 32px',
                    gap: '40px',
                    background: '#FFFFFF'
                },
            }}
        >
            <IconButton
                onClick={() => handleIsOpenNewCourse(false)}
                aria-label="Закрыть"
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: '#FFFFFF',
                    zIndex: 1,
                }}
            >
                <CloseIcon />
            </IconButton>
            <h3 style={{ margin: 0, display: 'flex', justifyContent: 'center' }}>Создать новый курс</h3>
            <InputForm
                label=""
                name="name"
                type="text"
                value={createCourseForm.name || ''}
                placeholder="Название курса"
                onChange={handleChangeCreateCourse}
                error={!!errorsCreateCourseForm.name}
                helperText={errorsCreateCourseForm.name}
                width="100%"
                dataTestId="name-input"
            />
            <InputForm
                label=""
                name="description"
                type="text"
                value={createCourseForm.description || ''}
                placeholder="Описание курса"
                onChange={handleChangeCreateCourse}
                error={!!errorsCreateCourseForm.description}
                helperText={errorsCreateCourseForm.description}
                width="100%"
                dataTestId="description-input"
            />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                <SubmitButton text="Отмена" colorScheme="secondary" onClick={() => handleIsOpenNewCourse(false)} />
                <SubmitButton id="createCourse-button" text="Создать" colorScheme="primary" onClick={() => createNewCourse()} />
            </div>
        </Dialog>
    );
};

export default CreateCourseDialog;