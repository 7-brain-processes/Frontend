import { Dialog, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import InputForm from "../../components/InputForm";
import SubmitButton from "../../components/SubmitButton";
import { JoinToCourse } from "../../types/JoinToCourse";

interface JoinToCourseDialogProps {
    isOpenJoinCourse: boolean;
    handleIsOpenJoinCourse: (isOpen: boolean) => void;
    handleChangeJoinCourse: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorsJoinToCourseForm: Partial<Record<keyof JoinToCourse, string>>;
    joinToCourseForm: JoinToCourse;
    joinToCourse: () => void;
}

const JoinToCourseDialog: React.FC<JoinToCourseDialogProps> = ({ isOpenJoinCourse, handleIsOpenJoinCourse, handleChangeJoinCourse, errorsJoinToCourseForm, joinToCourseForm, joinToCourse }) => {
    return (
        <Dialog
            open={isOpenJoinCourse}
            onClose={() => handleIsOpenJoinCourse(false)}
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
                onClick={() => handleIsOpenJoinCourse(false)}
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
            <h3 style={{ margin: 0, display: 'flex', justifyContent: 'center' }}>Присоединиться к курсу</h3>
            <InputForm
                label=""
                name="code"
                type="text"
                value={joinToCourseForm.code || ''}
                placeholder="Код курса"
                onChange={handleChangeJoinCourse}
                error={!!errorsJoinToCourseForm.code}
                helperText={errorsJoinToCourseForm.code}
                width="100%"
                dataTestId="code-input"
            />
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                <SubmitButton text="Отмена" colorScheme="secondary" onClick={() => handleIsOpenJoinCourse(false)} />
                <SubmitButton id="joinCourse-button" text="Присоединиться" colorScheme="primary" onClick={() => joinToCourse()} />
            </div>
        </Dialog>
    );
};

export default JoinToCourseDialog;