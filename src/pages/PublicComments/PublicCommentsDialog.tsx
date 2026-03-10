import { Dialog, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { CommentDto, CreateCommentRequest } from "../../types";
import InputForm from "../../components/InputForm";
import { useEffect } from "react";
import PublicCommentsItem from "./components/PublicCommentsItem";

interface PublicCommentsDialogProps {
    isOpenPublicComments: boolean;
    handleIsOpenPublicComments: (isOpen: boolean) => void;
    getPublicComments: (courseId: string, postId: string, params?: { page?: number; size?: number }) => void;
    courseId: string;
    postId: string;
    publicComments: CommentDto[];
    createCommentForm: CreateCommentRequest;
    handleChangeCreateComment: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorsCreateCommentForm: Partial<Record<keyof CreateCommentRequest, string>>;
    createPublicComment: (courseId: string, postId: string) => void;
    onCommentCreated?: () => void;
    deleteComments: (courseId: string, postId: string, commentId: string) => void;
    editPublicComment: (courseId: string, postId: string, commentId: string) => void;
    setIsEditComment: (isEditComment: boolean) => void;
    isEditComment: boolean;
    errorsEditCommentForm: Partial<Record<keyof CreateCommentRequest, string>>;
    editCommentForm: CreateCommentRequest;
    handleChangeEditComment: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PublicCommentsDialog: React.FC<PublicCommentsDialogProps> = ({ isOpenPublicComments, handleIsOpenPublicComments, getPublicComments, courseId, postId, publicComments, createCommentForm, handleChangeCreateComment, errorsCreateCommentForm, createPublicComment, onCommentCreated, deleteComments, editPublicComment, setIsEditComment, isEditComment, errorsEditCommentForm, editCommentForm, handleChangeEditComment }) => {

    useEffect(() => {
        if (isOpenPublicComments && courseId && postId) {
            getPublicComments(courseId, postId);
        }
    }, [isOpenPublicComments, courseId, postId]);

    return (
        <Dialog
            open={isOpenPublicComments}
            onClose={() => handleIsOpenPublicComments(false)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '24px',
                    width: '700px',
                    height: 'auto',
                    padding: '40px 32px',
                    gap: '40px',
                    background: '#FFFFFF'
                },
            }}
        >
            <IconButton
                onClick={() => handleIsOpenPublicComments(false)}
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
            <h3 style={{ margin: 0, display: 'flex', justifyContent: 'center' }}>Комментарии</h3>
            {publicComments.length !== 0 ?
                (
                    <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '16px' }}>
                        {publicComments.map(publicComment => (
                            <PublicCommentsItem key={publicComment.id} publicComment={publicComment} deleteComments={deleteComments}
                                courseId={courseId} postId={postId} editPublicComment={editPublicComment} setIsEditComment={setIsEditComment} isEditComment={isEditComment}
                                errorsEditCommentForm={errorsEditCommentForm} editCommentForm={editCommentForm} handleChangeEditComment={handleChangeEditComment} />
                        ))}
                    </div>
                ) : (
                    <span>У этого поста нет комментариев.</span>
                )}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', width: '100%' }}>
                <InputForm
                    label=""
                    name="text"
                    type="text"
                    value={createCommentForm.text || ''}
                    placeholder="Добавьте комментарий..."
                    onChange={handleChangeCreateComment}
                    error={!!errorsCreateCommentForm.text}
                    helperText={errorsCreateCommentForm.text}
                    width="100%"
                    dataTestId="description-input"
                />
                <SendIcon style={{ cursor: 'pointer' }} onClick={async () => {
                    const success = await createPublicComment(courseId, postId);
                    if (onCommentCreated) {
                        onCommentCreated();
                    }
                }} />
            </div>
        </Dialog>
    );
};

export default PublicCommentsDialog;