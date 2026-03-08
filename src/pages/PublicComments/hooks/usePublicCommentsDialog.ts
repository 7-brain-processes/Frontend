import { useState } from "react"
import { CommentDto, CreateCommentRequest } from "../../../types";
import { postsService } from "../../../api/posts";

export const usePublicCommentsDialog = () => {
    const [isOpenPublicComments, setIsOpenPublicComments] = useState<boolean>(false);
    const [publicComments, setPublicComments] = useState<CommentDto[]>([]);
    const [createCommentForm, setCreateCommentForm] = useState<CreateCommentRequest>({
        text: ''
    });
    const [errorsCreateCommentForm, setErrorsCreateCommentForm] = useState<Partial<Record<keyof CreateCommentRequest, string>>>({});

    const handleIsOpenPublicComments = (isOpen: boolean) => {
        setIsOpenPublicComments(isOpen);
        setCreateCommentForm({
            text: ''
        });
        setErrorsCreateCommentForm({});
    }

    const handleChangeCreateComment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCreateCommentForm(prev => ({ ...prev, [name]: value }));
    };

    const validateCreateCommentForm = (): boolean => {
        const e: typeof errorsCreateCommentForm = {};

        if (!createCommentForm?.text) {
            e.text = 'Поле обязательно.';
        }
        else if (createCommentForm?.text.length > 5000) {
            e.text = 'Неправильная валидация.';
        }

        setErrorsCreateCommentForm(e);
        return Object.keys(e).length === 0;
    };

    const getPublicComments = async (courseId: string, postId: string, params?: { page?: number; size?: number }) => {
        try {
            const result = await postsService.listPostComments(courseId, postId, params);
            if (result) {
                setPublicComments(result.content);
            }
        }
        catch (error: any) {
            console.error(error.message);
            alert(`Ошибка: ${error.message}`);
        }
    }

    const createPublicComment = async (courseId: string, postId: string) => {
        if (!validateCreateCommentForm()) return false;

        try {
            const result = await postsService.createPostComment(courseId, postId, createCommentForm);

            if (result) {
                getPublicComments(courseId, postId);
            }
        }
        catch (error: any) {
            console.error(error.message);
            alert(`Ошибка: ${error.message}`);
        }
    }

    return {
        state: { isOpenPublicComments, publicComments, createCommentForm, errorsCreateCommentForm },
        functions: {
            handleIsOpenPublicComments,
            getPublicComments,
            handleChangeCreateComment,
            createPublicComment
        }
    }
}