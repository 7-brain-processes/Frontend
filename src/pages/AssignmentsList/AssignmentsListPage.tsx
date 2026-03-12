import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService, postsService } from '../../api/services';
import { CourseDto, PostDto } from '../../types/api';
import './AssignmentsListPage.css';

type AssignmentListItem = {
  course: CourseDto;
  assignment: PostDto;
};

const formatDeadline = (deadline: string | null) => {
  if (!deadline) {
    return 'Без срока';
  }

  return new Date(deadline).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AssignmentsListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AssignmentListItem[]>([]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        setError(null);

        const coursesResponse = await coursesService.listMyCourses();
        const courses = coursesResponse.content;

        const tasksByCourse = await Promise.all(
          courses.map(async (course) => {
            const postsResponse = await postsService.listPosts(course.id, { type: 'TASK', size: 100 });
            return postsResponse.content.map((assignment) => ({
              course,
              assignment,
            }));
          })
        );

        const nextItems = tasksByCourse
          .flat()
          .sort((left, right) => {
            const leftTime = left.assignment.deadline ? new Date(left.assignment.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            const rightTime = right.assignment.deadline ? new Date(right.assignment.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            return leftTime - rightTime;
          });

        setItems(nextItems);
      } catch (err: any) {
        console.error('Failed to load assignments list:', err);
        setItems([]);
        setError(err.message || 'Ошибка загрузки списка заданий');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  return (
    <div className="assignments-list-page">
      <main className="assignments-list-main">
        <div className="assignments-list-container">
          <div className="assignments-list-header">
          </div>

          {loading && <div className="assignments-list-status">Загрузка заданий...</div>}
          {error && <div className="assignments-list-error">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="assignments-list-empty">
              <h2>Заданий пока нет</h2>
              <p>Когда преподаватели добавят задания в курсах, они появятся здесь.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="assignments-list-grid">
              {items.map(({ course, assignment }) => {
                const isOverdue = assignment.deadline ? new Date(assignment.deadline).getTime() < Date.now() : false;

                return (
                  <button
                    key={assignment.id}
                    type="button"
                    className={`assignment-overview-card ${isOverdue ? 'overdue' : ''}`}
                    onClick={() => navigate(`/course/${course.id}/task/${assignment.id}`)}
                  >
                    <div className="assignment-overview-top">
                      <span className="assignment-course-badge">{course.name}</span>
                      <span className={`assignment-deadline-badge ${isOverdue ? 'overdue' : ''}`}>
                        {formatDeadline(assignment.deadline)}
                      </span>
                    </div>

                    <div className="assignment-overview-body">
                      <h2>{assignment.title}</h2>
                      <p>{assignment.content || 'Без описания'}</p>
                    </div>

                    <div className="assignment-overview-footer">
                      <span>{course.currentUserRole === 'TEACHER' ? 'Вы преподаватель' : 'Вы студент'}</span>
                      <span>Открыть</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignmentsListPage;
