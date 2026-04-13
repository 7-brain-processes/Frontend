import { TeamRequirementTemplateDto } from '../../../../types/TeamRequirementTemplate';
import '../TeamRequirementTemplateTab.css';

interface TeamRequirementTemplateByIdProps {
    setShowTemplate: (showTemplate: boolean) => void;
    template: TeamRequirementTemplateDto;
    showTemplate: boolean;
}

const TeamRequirementTemplateById = ({ setShowTemplate, template, showTemplate }: TeamRequirementTemplateByIdProps) => {

    const formatDate = (date: (Date | undefined)) => {
        if (!date) return "Нет данных";
        return new Date(date).toLocaleDateString("ru-RU");
    };

    return (
        <div>
            {showTemplate && (
                <div className="modal-overlay" onClick={() => setShowTemplate(false)}>
                    <div className="modal-dialog" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Шаблон требований</h2>
                            <button className="close-button" onClick={() => setShowTemplate(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="category-code">
                                <strong>Название:</strong> {template.name}
                            </div>
                            <div className="category-details">
                                <span>Описание: {template.description}</span>
                            </div>
                            <div className="category-details">
                                <span>Размер команды: {template.minTeamSize} - {template.maxTeamSize}</span>
                            </div>
                            <div className="category-details">
                                <span>Категория: {template.requiredCategory.title}</span>
                            </div>
                            <div className="category-details">
                                <span>Аудио: {template.requireAudio ? 'требуется' : 'не требуется'}</span>
                            </div>
                            <div className="category-details">
                                <span>Видео: {template.requireVideo ? 'требуется' : 'не требуется'}</span>
                            </div>
                            ы {!template.active && (
                                <div className="modal-body">
                                    <div className="category-status">Заархивирован</div>
                                    <div className="category-status">Дата архивирования: {formatDate(template.archivedAt)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamRequirementTemplateById;