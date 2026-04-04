import { CourseRole } from "../../../types";
import './CategoryTab.css';
import CreatCategoryDialog from "./components/CreatCategoryDialog";
import { useCategoryTab } from "./hooks/useCategoryTab";

interface CategoryTabProps {
    courseId: string;
    userRole: CourseRole;
}

const CategoryTab = ({ courseId, userRole }: CategoryTabProps) => {

    const { state, functions } = useCategoryTab(courseId, userRole);

    return (
        <div className="categories-tab">
            <div className="categories-section">
                <div className="section-header">
                    <h2>Категории</h2>
                    {userRole === 'TEACHER' ? (
                        <button
                            className="create-category-button"
                            onClick={() => functions.handleCreateCategory()}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Создать категорию
                        </button>) : (
                        null
                    )}
                </div>
                <CreatCategoryDialog setShowCreateCategory={functions.setShowCreateCategory} categoryForm={state.categoryForm} setCategoryForm={functions.setCategoryForm}
                    editingCategory={state.editingCategory} handleSaveCategory={functions.handleSaveCategory} showCreateCategory={state.showCreateCategory} handleToggle={functions.handleToggle} />

                {state.categories.length === 0 ? (
                    <div className="empty-categories">
                        <p>Доступных категорий нет</p>
                    </div>
                ) : (
                    <div className="categories-list">
                        {state.categories.map((category) => {
                            return (
                                <div key={category.id} className={`category-card ${!category.active ? 'inactive' : ''}`}>
                                    <div className="category-info">
                                        <div className="category-code">
                                            <strong>Название:</strong> {category.title}
                                        </div>
                                        <div className="category-details">
                                            <span>Описание: {category.description}</span>
                                        </div>
                                        {!category.active && (
                                            <div className="category-status">Не активна</div>
                                        )}
                                    </div>
                                    {userRole === 'TEACHER' ? (
                                        <div className="category-actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => functions.handleEditCategory(category)}
                                                title="Редактировать категорию"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => functions.handleDeleteCategory(courseId, category.id)}
                                                title="Удалить категорию"
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            {category.active && (
                                                <div className="category-actions">
                                                    {category.id !== state.myCategory?.id ? (
                                                        <button
                                                            className="edit-button"
                                                            onClick={() => functions.chooseMyCategory(category.id)}
                                                            title="Выбрать категорию"
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="delete-button"
                                                            onClick={() => functions.deleteMyCategory()}
                                                            title="Удалить категорию"
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {userRole === 'STUDENT' && (
                <div className="categories-section">
                    <div className="section-header">
                        <h2>Моя категория</h2>
                    </div>
                    {!state.myCategory ? (
                        <div className="empty-categories">
                            <p>У тебя нет выбранной категории</p>
                        </div>
                    ) : (
                        <div className="categories-list">
                            <div key={state.myCategory.id} className={`category-card ${!state.myCategory.active ? 'inactive' : ''}`}>
                                <div className="category-info">
                                    <div className="category-code">
                                        <strong>Название:</strong> {state.myCategory.title}
                                    </div>
                                    <div className="category-details">
                                        <span>Описание: {state.myCategory.description}</span>
                                    </div>
                                    {!state.myCategory.active && (
                                        <div className="category-status">Не активна</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CategoryTab;