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
}

const PublicCommentsDialog: React.FC<PublicCommentsDialogProps> = ({ isOpenPublicComments, handleIsOpenPublicComments, getPublicComments, courseId, postId, publicComments, createCommentForm, handleChangeCreateComment, errorsCreateCommentForm, createPublicComment }) => {

    useEffect(() => {
        getPublicComments(courseId, postId);
    }, [isOpenPublicComments]);

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
                            <PublicCommentsItem key={publicComment.id} publicComment={publicComment} />
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
                <SendIcon style={{ cursor: 'pointer' }} onClick={() => createPublicComment(courseId, postId)} />
            </div>
        </Dialog>
    );
};

export default PublicCommentsDialog;