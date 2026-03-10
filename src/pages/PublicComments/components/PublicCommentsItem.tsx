import React from 'react';
import { CommentDto, CreateCommentRequest } from "../../../types";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InputForm from '../../../components/InputForm';
import SendIcon from '@mui/icons-material/Send';

interface PublicCommentsItemProps {
    publicComment: CommentDto;
    deleteComments: (courseId: string, postId: string, commentId: string) => void;
    courseId: string;
    postId: string;
    editPublicComment: (courseId: string, postId: string, commentId: string) => void;
    setIsEditComment: (isEditComment: boolean) => void;
    isEditComment: boolean;
    errorsEditCommentForm: Partial<Record<keyof CreateCommentRequest, string>>;
    editCommentForm: CreateCommentRequest;
    handleChangeEditComment: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PublicCommentsItem: React.FC<PublicCommentsItemProps> = ({ publicComment, deleteComments, courseId, postId, editPublicComment, setIsEditComment, isEditComment, errorsEditCommentForm, editCommentForm, handleChangeEditComment }) => {

    const formatDate = (date: (Date)) => {
        if (!date) return "Нет данных";
        return new Date(date).toLocaleDateString("ru-RU");
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', borderBottom: '1px solid #CED2DA', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                    <span style={{ color: '#2076e0', fontSize: '14px' }}>{publicComment.author.displayName}</span>
                    <span style={{ fontSize: '14px' }}>-</span>
                    <span style={{ fontSize: '14px' }}>{formatDate(publicComment.createdAt)}</span>
                </div>
                {isEditComment ? (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', width: '100%' }}>
                        <InputForm
                            label=""
                            name="text"
                            type="text"
                            value={publicComment.text || editCommentForm.text || ''}
                            placeholder="Добавьте комментарий..."
                            onChange={handleChangeEditComment}
                            error={!!errorsEditCommentForm.text}
                            helperText={errorsEditCommentForm.text}
                            width="100%"
                            dataTestId="description-input"
                        />
                        <SendIcon style={{ cursor: 'pointer' }} onClick={() => editPublicComment(courseId, postId, publicComment.id)} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{publicComment.text}</span>
                    </div>
                )}
            </div>
            {localStorage.getItem('id') === publicComment.author.id ? (
                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                    <EditIcon style={{ cursor: 'pointer' }} onClick={() => setIsEditComment(!isEditComment)} />
                    <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => deleteComments(courseId, postId, publicComment.id)} />
                </div>
            ) : (
                null
            )}
        </div>
    );
};

export default PublicCommentsItem;