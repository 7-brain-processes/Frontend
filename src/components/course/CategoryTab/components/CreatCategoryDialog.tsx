import { CourseCategoryDto, CreateCourseCategory } from '../../../../types';
import '../CategoryTab.css';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface CreatCategoryDialogProps {
    setShowCreateCategory: (showCreateCategory: boolean) => void;
    categoryForm: CreateCourseCategory;
    setCategoryForm: (createCourseCategory: CreateCourseCategory) => void;
    editingCategory: CourseCategoryDto | null;
    handleSaveCategory: () => void;
    showCreateCategory: boolean;
    handleToggle: () => void;
}

const CreatCategoryDialog = ({ setShowCreateCategory, categoryForm, setCategoryForm, editingCategory, handleSaveCategory, showCreateCategory, handleToggle }: CreatCategoryDialogProps) => {

    return (
        <div>
            {showCreateCategory && (
                <div className="modal-overlay" onClick={() => setShowCreateCategory(false)}>
                    <div className="modal-dialog" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Редактировать категорию' : 'Создать категорию'}</h2>
                            <button className="close-button" onClick={() => setShowCreateCategory(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="category-title">Название категории *</label>
                                <input
                                    id="category-title"
                                    type="text"
                                    value={categoryForm.title}
                                    onChange={e => setCategoryForm({ ...categoryForm, title: e.target.value })}
                                    placeholder="Введите название задания"
                                    data-testid="category-title-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category-content">Описание категории</label>
                                <textarea
                                    id="category-content"
                                    value={categoryForm.description}
                                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    placeholder="Введите описание категории"
                                    rows={8}
                                    data-testid="category-content-input"
                                />
                            </div>
                            <div>
                                <FormControlLabel control={<Switch checked={categoryForm.active} onChange={handleToggle} />}
                                    label={categoryForm.active ? "Активна" : "Не активна"} />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="button-secondary" onClick={() => setShowCreateCategory(false)}>
                                Отмена
                            </button>
                            <button className="button-primary" onClick={handleSaveCategory} data-testid="save-category-button">
                                {editingCategory ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatCategoryDialog;