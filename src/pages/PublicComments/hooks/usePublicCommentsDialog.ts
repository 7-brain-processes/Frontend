import { useState } from "react"
import { CommentDto, CreateCommentRequest } from "../../../types";
import { postsService } from "../../../api/posts";

export const createPublicCommentFunc = async (courseId: string, postId: string, setPublicComments: React.Dispatch<React.SetStateAction<CommentDto[]>>, validateCreateCommentForm: () => boolean, createCommentForm: CreateCommentRequest, setCreateCommentForm: React.Dispatch<React.SetStateAction<CreateCommentRequest>>): Promise<boolean> => {
    if (!validateCreateCommentForm()) return false;

    try {
        const result = await postsService.createPostComment(courseId, postId, createCommentForm);

        if (result) {
            await getPublicCommentsFunc(courseId, postId, setPublicComments);
            setCreateCommentForm({ text: '' });
            return true;
        }
        return false;
    }
    catch (error: any) {
        console.error(error.message);
        alert(`Ошибка: ${error.message}`);
        return false;
    }
}

export const getPublicCommentsFunc = async (courseId: string, postId: string, setPublicComments: React.Dispatch<React.SetStateAction<CommentDto[]>>, params?: { page?: number; size?: number }) => {
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

export const deleteCommentsFunc = async (courseId: string, postId: string, commentId: string, setPublicComments: React.Dispatch<React.SetStateAction<CommentDto[]>>) => {
    try {
        await postsService.deletePostComment(courseId, postId, commentId);
        getPublicCommentsFunc(courseId, postId, setPublicComments);
    }
    catch (error: any) {
        console.error(error.message);
        alert(`Ошибка: ${error.message}`);
    }
}

export const editPublicCommentFunc = async (courseId: string, postId: string, commentId: string, setPublicComments: React.Dispatch<React.SetStateAction<CommentDto[]>>, validateEditCommentForm: () => boolean, editCommentForm: CreateCommentRequest, setEditCommentForm: React.Dispatch<React.SetStateAction<CreateCommentRequest>>, setIsEditComment: (isEditComment: boolean) => void): Promise<boolean> => {
    if (!validateEditCommentForm()) return false;

    try {
        const result = await postsService.updatePostComment(courseId, postId, commentId, editCommentForm);

        if (result) {
            await getPublicCommentsFunc(courseId, postId, setPublicComments);
            setIsEditComment(false);
            setEditCommentForm({ text: '' });
            return true;
        }
        return false;
    }
    catch (error: any) {
        console.error(error.message);
        alert(`Ошибка: ${error.message}`);
        return false;
    }
}

export const usePublicCommentsDialog = () => {
    const [isOpenPublicComments, setIsOpenPublicComments] = useState<boolean>(false);
    const [publicComments, setPublicComments] = useState<CommentDto[]>([]);
    const [createCommentForm, setCreateCommentForm] = useState<CreateCommentRequest>({
        text: ''
    });
    const [errorsCreateCommentForm, setErrorsCreateCommentForm] = useState<Partial<Record<keyof CreateCommentRequest, string>>>({});
    const [errorsEditCommentForm, setErrorsEditCommentForm] = useState<Partial<Record<keyof CreateCommentRequest, string>>>({});
    const [editCommentForm, setEditCommentForm] = useState<CreateCommentRequest>({
        text: ''
    });
    const [isEditComment, setIsEditComment] = useState<boolean>(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

    const handleIsOpenPublicComments = (isOpen: boolean) => {
        setIsOpenPublicComments(isOpen);
        setCreateCommentForm({
            text: ''
        });
        setErrorsCreateCommentForm({});
        setErrorsEditCommentForm({});
        setEditCommentForm({ text: '' });
        setIsEditComment(false);
        setEditingCommentId(null);
        if (!isOpen) {
            setPublicComments([]);
        }
    }

    const startEditComment = (commentId: string, text: string) => {
        if (isEditComment && editingCommentId === commentId) {
            setIsEditComment(false);
            setEditingCommentId(null);
            setEditCommentForm({ text: '' });
            setErrorsEditCommentForm({});
            return;
        }

        setIsEditComment(true);
        setEditingCommentId(commentId);
        setEditCommentForm({ text });
        setErrorsEditCommentForm({});
    };

    const handleChangeCreateComment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCreateCommentForm(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEditComment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditCommentForm(prev => ({ ...prev, [name]: value }));
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

    const validateEditCommentForm = (): boolean => {
        const e: typeof errorsEditCommentForm = {};

        if (!editCommentForm?.text) {
            e.text = 'Поле обязательно.';
        }
        else if (editCommentForm?.text.length > 5000) {
            e.text = 'Неправильная валидация.';
        }

        setErrorsEditCommentForm(e);
        return Object.keys(e).length === 0;
    };

    const getPublicComments = (courseId: string, postId: string, params?: { page?: number; size?: number }) => {
        getPublicCommentsFunc(courseId, postId, setPublicComments, params);
    }

    const createPublicComment = (courseId: string, postId: string) => {
        createPublicCommentFunc(courseId, postId, setPublicComments, validateCreateCommentForm, createCommentForm, setCreateCommentForm);
    }

    const editPublicComment = (courseId: string, postId: string, commentId: string) => {
        editPublicCommentFunc(courseId, postId, commentId, setPublicComments, validateEditCommentForm, editCommentForm, setEditCommentForm, setIsEditComment);
    }

    const deleteComments = (courseId: string, postId: string, commentId: string) => {
        deleteCommentsFunc(courseId, postId, commentId, setPublicComments);
    }

    return {
        state: { isOpenPublicComments, publicComments, createCommentForm, errorsCreateCommentForm, isEditComment, errorsEditCommentForm, editCommentForm, editingCommentId },
        functions: {
            handleIsOpenPublicComments,
            getPublicComments,
            handleChangeCreateComment,
            createPublicComment,
            editPublicComment,
            deleteComments,
            setIsEditComment,
            handleChangeEditComment,
            startEditComment
        }
    }
}