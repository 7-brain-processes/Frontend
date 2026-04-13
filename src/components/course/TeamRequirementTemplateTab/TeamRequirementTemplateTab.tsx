import { CourseRole } from "../../../types";
import TeamRequirementTemplateById from "./components/TeamRequirementTemplateById";
import { useTeamRequirementTemplateTab } from "./hooks/useTeamRequirementTemplateTab";
import './TeamRequirementTemplateTab.css';

interface TeamRequirementTemplateTabProps {
    courseId: string;
    userRole: CourseRole;
}

const TeamRequirementTemplateTab = ({ courseId, userRole }: TeamRequirementTemplateTabProps) => {

    const { state, functions } = useTeamRequirementTemplateTab(courseId, userRole);

    return (
        <div className="categories-tab">
            <div className="categories-section">
                <div className="section-header">
                    <h2>Шаблоны требований к команде</h2>
                    {/*{userRole === 'TEACHER' ? (
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
                    )}*/}
                </div>
                {/* <CreatCategoryDialog setShowCreateCategory={functions.setShowCreateCategory} categoryForm={state.categoryForm} setCategoryForm={functions.setCategoryForm}
                    editingCategory={state.editingCategory} handleSaveCategory={functions.handleSaveCategory} showCreateCategory={state.showCreateCategory} handleToggle={functions.handleToggle} />
*/}
                {state.templates.length === 0 ? (
                    <div className="empty-categories">
                        <p>Доступных шаблонов нет</p>
                    </div>
                ) : (
                    <div className="categories-list">
                        {state.templates.map((template) => {
                            return (
                                <div key={template.id} className={`category-card ${!template.active ? 'inactive' : ''}`}>
                                    <div className="category-info">
                                        <div className="category-code">
                                            <strong onClick={() => functions.setShowTemplate(true)} style={{ cursor: 'pointer' }}>Название:</strong> {template.name}
                                        </div>
                                        <TeamRequirementTemplateById setShowTemplate={functions.setShowTemplate} template={template} showTemplate={state.showTemplate} />
                                        <div className="category-details">
                                            <span>Описание: {template.description}</span>
                                        </div>
                                        <div className="category-details">
                                            <span>Размер команды: {template.minTeamSize} - {template.maxTeamSize}</span>
                                        </div>
                                        <div className="category-details">
                                            <span>Категория: {template.requiredCategory.title}</span>
                                        </div>
                                        {!template.active && (
                                            <div className="category-status">Не активен</div>
                                        )}
                                    </div>
                                    {userRole === 'TEACHER' && (
                                        <div className="category-actions">
                                            <button
                                                className="delete-button"
                                                onClick={() => functions.deleteTeamRequirementTemplate(template.id)}
                                                title="Архивировать шаблон"
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeamRequirementTemplateTab;