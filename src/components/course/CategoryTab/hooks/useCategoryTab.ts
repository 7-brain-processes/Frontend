import { useEffect, useState } from "react";
import { CourseCategoryDto, CourseRole, CreateCourseCategory } from "../../../../types";
import { categoryService } from "../../../../api/category";

export const loadCategoriesFunc = async (courseId: string | undefined, setCategories: React.Dispatch<React.SetStateAction<CourseCategoryDto[]>>) => {
    if (!courseId) return false;

    try {
        const categories = await categoryService.listCategories(courseId);
        setCategories(categories);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        setCategories([]);
        alert(err.message || 'Ошибка загрузки категорий');
    }
};

export const handleSaveCategoryFunc = async (categoryForm: CreateCourseCategory, editingCategory: CourseCategoryDto | null, courseId: string | undefined, setCategories: React.Dispatch<React.SetStateAction<CourseCategoryDto[]>>, categories: CourseCategoryDto[], setShowCreateCategory: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!courseId) return false;

    if (!categoryForm.title.trim()) {
        alert('Введите название категории');
        return false;
    }

    try {
        if (editingCategory) {
            const editCategory = await categoryService.updateCategory(courseId, editingCategory.id, {
                title: categoryForm.title,
                description: categoryForm.description,
                active: categoryForm.active
            });
            setCategories(categories.map(a => (a.id === editingCategory.id ? editCategory : a)));
        } else {
            const newCategory = await categoryService.createCategory({
                title: categoryForm.title,
                description: categoryForm.description,
                active: categoryForm.active
            },
                courseId);
            setCategories([...categories, newCategory]);
        }

        setShowCreateCategory(false);
    } catch (err: any) {
        console.error('Failed to save category:', err);
        alert(err.message || 'Ошибка сохранения категории');
    }
};

export const handleDeleteCategoryFunc = async (courseId: string | undefined, categoryId: string | undefined, setCategories: React.Dispatch<React.SetStateAction<CourseCategoryDto[]>>, categories: CourseCategoryDto[]) => {
    if (!courseId) return false;
    if (!categoryId) return false;

    try {
        await categoryService.deleteCategory(courseId, categoryId);
        setCategories(categories.filter((i) => i.id !== categoryId));
    } catch (err: any) {
        console.error('Failed to delete invite:', err);
        alert(err.message || 'Ошибка удаления категории');
    }
};

export const loadMyCategoryFunc = async (courseId: string | undefined, setMyCategory: React.Dispatch<React.SetStateAction<CourseCategoryDto | null>>) => {
    if (!courseId) return false;

    try {
        const category = await categoryService.getMyCategory(courseId);
        setMyCategory(category);
    } catch (err: any) {
        const message = String(err?.message || '');
        if (message.includes('404')) {
            setMyCategory(null);
            return;
        }

        console.error('Failed to load course:', err);
        alert(err.message || 'Ошибка загрузки категории');
    }
};

export const deleteMyCategoryFunc = async (courseId: string | undefined, setMyCategory: React.Dispatch<React.SetStateAction<CourseCategoryDto | null>>) => {
    if (!courseId) return false;

    try {
        const category = await categoryService.setMyCategory(courseId, { categoryId: null });
        setMyCategory(category);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        alert(err.message || 'Ошибка удаления категории');
    }
};

export const chooseMyCategoryFunc = async (courseId: string | undefined, categoryId: string | undefined, setMyCategory: React.Dispatch<React.SetStateAction<CourseCategoryDto | null>>) => {
    if (!courseId) return false;
    if (!categoryId) return false;

    try {
        const category = await categoryService.setMyCategory(courseId, { categoryId });
        setMyCategory(category);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        alert(err.message || 'Ошибка выбора категории');
    }
};

export const useCategoryTab = (courseId: string, userRole: CourseRole) => {
    const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
    const [myCategory, setMyCategory] = useState<CourseCategoryDto | null>(null);
    const [showCreateCategory, setShowCreateCategory] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<CourseCategoryDto | null>(null);
    const [categoryForm, setCategoryForm] = useState<CreateCourseCategory>({
        title: '',
        description: '',
        active: true
    });

    const handleToggle = () => {
        setCategoryForm(prev => ({
            ...prev,
            active: !prev.active
        }));
    };

    const handleCreateCategory = () => {
        setEditingCategory(null);
        setCategoryForm({
            title: '',
            description: '',
            active: true
        });
        setShowCreateCategory(true);
    };

    const handleEditCategory = (category: CourseCategoryDto) => {
        setEditingCategory(category);
        setCategoryForm({
            title: category.title,
            description: category.description || '',
            active: category.active
        });
        setShowCreateCategory(true);
    };

    const handleSaveCategory = () => {
        handleSaveCategoryFunc(categoryForm, editingCategory, courseId, setCategories, categories, setShowCreateCategory);
    };

    const handleDeleteCategory = (courseId: string, categoryId: string) => {
        handleDeleteCategoryFunc(courseId, categoryId, setCategories, categories);
    };

    const loadCategories = () => {
        loadCategoriesFunc(courseId, setCategories);
    };

    const loadMyCategory = () => {
        loadMyCategoryFunc(courseId, setMyCategory);
    };

    const deleteMyCategory = () => {
        deleteMyCategoryFunc(courseId, setMyCategory)
    };

    const chooseMyCategory = (categoryId: string) => {
        chooseMyCategoryFunc(courseId, categoryId, setMyCategory)
    };

    useEffect(() => {
        loadCategories();
        if (userRole === 'STUDENT') {
            loadMyCategory();
        }
    }, []);

    return {
        state: { categories, categoryForm, editingCategory, showCreateCategory, myCategory },
        functions: {
            handleToggle,
            handleCreateCategory,
            handleEditCategory,
            handleDeleteCategory,
            setShowCreateCategory,
            setCategoryForm,
            handleSaveCategory,
            deleteMyCategory,
            chooseMyCategory
        }
    }
}
