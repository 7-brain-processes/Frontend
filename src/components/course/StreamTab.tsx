import React, { useState, useEffect } from 'react';
import { PostDto, CourseRole, PostType } from '../../types/api';
import { postsService } from '../../api/services';
import { mockPosts } from '../../data/mockData';
import './StreamTab.css';
import PublicCommentsDialog from '../../pages/PublicComments/PublicCommentsDialog';
import { usePublicCommentsDialog } from '../../pages/PublicComments/hooks/usePublicCommentsDialog';

interface StreamTabProps {
  courseId: string;
  userRole: CourseRole;
}

const StreamTab: React.FC<StreamTabProps> = ({ courseId, userRole }) => {
  const { state, functions } = usePublicCommentsDialog();

  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<PostDto | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    type: 'MATERIAL' as PostType,
    deadline: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const toDateTimeLocal = (isoString: string | undefined | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    loadPosts();
  }, [courseId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsService.listPosts(courseId);
      setPosts(response.content);
    } catch (err: any) {
      console.error('Failed to load posts, using mock data:', err);
      const courseMockPosts = mockPosts[courseId] || [];
      setPosts(courseMockPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setPostForm({ title: '', content: '', type: 'MATERIAL', deadline: '' });
    setSelectedFiles([]);
    setShowCreatePost(true);
  };

  const handleEditPost = (post: PostDto) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content || '',
      type: post.type,
      deadline: toDateTimeLocal(post.deadline)
    });
    setShowCreatePost(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      try {
        await postsService.deletePost(courseId, postId);
        setPosts(posts.filter(p => p.id !== postId));
      } catch (err: any) {
        console.error('Failed to delete post:', err);
        alert(err.message || 'Ошибка удаления поста');
      }
    }
  };

  const handleSavePost = async () => {
    if (!postForm.title.trim()) {
      alert('Введите название поста');
      return;
    }

    if (postForm.type === 'TASK' && !postForm.deadline) {
      alert('Для задания необходимо указать срок сдачи');
      return;
    }

    try {
      if (editingPost) {
        const updatedPost = await postsService.updatePost(courseId, editingPost.id, {
          title: postForm.title,
          content: postForm.content || undefined,
          deadline: postForm.deadline ? new Date(postForm.deadline).toISOString() : undefined,
        });
        setPosts(posts.map(p => (p.id === editingPost.id ? updatedPost : p)));
      } else {
        const newPost = await postsService.createPost(courseId, {
          title: postForm.title,
          content: postForm.content || undefined,
          type: postForm.type,
          deadline: postForm.deadline ? new Date(postForm.deadline).toISOString() : undefined,
        });

        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            try {
              await postsService.uploadPostMaterial(courseId, newPost.id, file);
            } catch (err) {
              console.error('Failed to upload file:', err);
            }
          }
        }

        await loadPosts();
      }

      setShowCreatePost(false);
    } catch (err: any) {
      console.error('Failed to save post:', err);
      alert(err.message || 'Ошибка сохранения поста');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPostTypeLabel = (type: PostType) => {
    return type === 'MATERIAL' ? 'Материал' : 'Задание';
  };

  return (
    <div className="stream-tab">
      {/* Create Post Button (Teacher only) */}
      {userRole === 'TEACHER' && (
        <div className="stream-actions">
          <button
            className="create-post-button"
            onClick={handleCreatePost}
            data-testid="create-post-button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>Создать пост</span>
          </button>
        </div>
      )}

      {/* Posts List */}
      <div className="posts-list" data-testid="posts-list">
        {loading ? (
          <div className="loading-state">Загрузка постов...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="50" fill="#E8F0FE" />
                <path d="M45 50L55 60L45 70M65 70H75" stroke="#1967D2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="empty-state-title">Здесь будут появляться новые материалы курса</h2>
            <p className="empty-state-description">
              В ленте публикуются все новости и объявления курса.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card" data-testid="post-item">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.author.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{post.author.displayName}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div className="post-header-right">
                  <span className={`post-type-badge ${post.type.toLowerCase()}`}>
                    {getPostTypeLabel(post.type)}
                  </span>
                  {userRole === 'TEACHER' && (
                    <div className="post-actions">
                      <button
                        className="icon-button"
                        onClick={() => handleEditPost(post)}
                        title="Редактировать"
                        data-testid="edit-post-button"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => handleDeletePost(post.id)}
                        title="Удалить"
                        data-testid="delete-post-button"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="post-content">
                <h3 className="post-title" data-testid="post-title">{post.title}</h3>
                {post.content && (
                  <div className="post-text" data-testid="post-content">
                    {post.content}
                  </div>
                )}
                {post.deadline && (
                  <div className="post-deadline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    <span>Срок: {formatDate(post.deadline)}</span>
                  </div>
                )}
              </div>

              <div className="post-footer">
                <div className="post-stats">
                  {post.materialsCount > 0 && (
                    <span className="stat-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                      {post.materialsCount}
                    </span>
                  )}
                  {post.commentsCount > 0 && (
                    <>
                      <span className="stat-item" onClick={() => functions.handleIsOpenPublicComments(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                        </svg>
                        {post.commentsCount}
                      </span>
                      <PublicCommentsDialog isOpenPublicComments={state.isOpenPublicComments} handleIsOpenPublicComments={functions.handleIsOpenPublicComments}
                        getPublicComments={functions.getPublicComments} courseId={courseId} postId={post.id} publicComments={state.publicComments}
                        createCommentForm={state.createCommentForm} handleChangeCreateComment={functions.handleChangeCreateComment}
                        errorsCreateCommentForm={state.errorsCreateCommentForm} createPublicComment={functions.createPublicComment} />
                    </>
                  )}
                  {post.type === 'TASK' && post.mySolutionId && (
                    <span className="stat-item submitted">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Сдано
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Post Modal */}
      {showCreatePost && (
        <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPost ? 'Редактировать пост' : 'Создать пост'}</h2>
              <button className="close-button" onClick={() => setShowCreatePost(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="post-type">Тип поста</label>
                <select
                  id="post-type"
                  value={postForm.type}
                  onChange={e => setPostForm({ ...postForm, type: e.target.value as PostType })}
                  data-testid="post-type-select"
                >
                  <option value="MATERIAL">Материал</option>
                  <option value="TASK">Задание</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="post-title">Название *</label>
                <input
                  id="post-title"
                  type="text"
                  value={postForm.title}
                  onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="Введите название поста"
                  data-testid="post-title-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="post-content">Описание</label>
                <textarea
                  id="post-content"
                  value={postForm.content}
                  onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Введите описание поста"
                  rows={6}
                  data-testid="post-content-input"
                />
              </div>

              {postForm.type === 'TASK' && (
                <div className="form-group">
                  <label htmlFor="post-deadline">Срок сдачи *</label>
                  <input
                    id="post-deadline"
                    type="datetime-local"
                    value={postForm.deadline}
                    onChange={e => setPostForm({ ...postForm, deadline: e.target.value })}
                    data-testid="post-deadline-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Файлы</label>
                <div className="file-upload">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    id="file-input"
                    style={{ display: 'none' }}
                    data-testid="post-files-input"
                  />
                  <label htmlFor="file-input" className="file-upload-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                    </svg>
                    <span>Выбрать файлы</span>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                        <span>{file.name}</span>
                        <button type="button" onClick={() => handleRemoveFile(index)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowCreatePost(false)}>
                Отмена
              </button>
              <button className="button-primary" onClick={handleSavePost} data-testid="save-post-button">
                {editingPost ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamTab;
