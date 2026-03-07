import { apiRequest, setAuthToken } from './client';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserDto,
  CourseDto,
  PageCourseDto,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseRole,
  PostDto,
  PagePostDto,
  CreatePostRequest,
  UpdatePostRequest,
  PostType,
  FileDto,
  CommentDto,
  PageCommentDto,
  CreateCommentRequest,
  SolutionDto,
  PageSolutionDto,
  CreateSolutionRequest,
  SolutionStatus,
  GradeRequest,
  MemberDto,
  PageMemberDto,
  InviteDto,
  CreateInviteRequest,
} from '../types/api';
import { uploadFile, downloadFile } from './client';


export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(response.token);
    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(response.token);
    return response;
  },

  getCurrentUser: (): Promise<UserDto> => {
    return apiRequest<UserDto>('/auth/me');
  },
};


export const coursesService = {
  listMyCourses: (params?: {
    page?: number;
    size?: number;
    role?: CourseRole;
  }): Promise<PageCourseDto> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.role) queryParams.append('role', params.role);

    const query = queryParams.toString();
    return apiRequest<PageCourseDto>(`/courses${query ? `?${query}` : ''}`);
  },

  createCourse: (data: CreateCourseRequest): Promise<CourseDto> => {
    return apiRequest<CourseDto>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCourse: (courseId: string): Promise<CourseDto> => {
    return apiRequest<CourseDto>(`/courses/${courseId}`);
  },

  updateCourse: (courseId: string, data: UpdateCourseRequest): Promise<CourseDto> => {
    return apiRequest<CourseDto>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCourse: (courseId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  leaveCourse: (courseId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/leave`, {
      method: 'POST',
    });
  },
};


export const postsService = {
  listPosts: (
    courseId: string,
    params?: { page?: number; size?: number; type?: PostType }
  ): Promise<PagePostDto> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return apiRequest<PagePostDto>(
      `/courses/${courseId}/posts${query ? `?${query}` : ''}`
    );
  },

  createPost: (courseId: string, data: CreatePostRequest): Promise<PostDto> => {
    return apiRequest<PostDto>(`/courses/${courseId}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPost: (courseId: string, postId: string): Promise<PostDto> => {
    return apiRequest<PostDto>(`/courses/${courseId}/posts/${postId}`);
  },

  updatePost: (
    courseId: string,
    postId: string,
    data: UpdatePostRequest
  ): Promise<PostDto> => {
    return apiRequest<PostDto>(`/courses/${courseId}/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePost: (courseId: string, postId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  listPostMaterials: (courseId: string, postId: string): Promise<FileDto[]> => {
    return apiRequest<FileDto[]>(`/courses/${courseId}/posts/${postId}/materials`);
  },

  uploadPostMaterial: (courseId: string, postId: string, file: File): Promise<FileDto> => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFile<FileDto>(`/courses/${courseId}/posts/${postId}/materials`, formData);
  },

  deletePostMaterial: (courseId: string, postId: string, fileId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/materials/${fileId}`, {
      method: 'DELETE',
    });
  },

  downloadPostMaterial: (
    courseId: string,
    postId: string,
    fileId: string
  ): Promise<Blob> => {
    return downloadFile(`/courses/${courseId}/posts/${postId}/materials/${fileId}/download`);
  },

  listPostComments: (
    courseId: string,
    postId: string,
    params?: { page?: number; size?: number }
  ): Promise<PageCommentDto> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const query = queryParams.toString();
    return apiRequest<PageCommentDto>(
      `/courses/${courseId}/posts/${postId}/comments${query ? `?${query}` : ''}`
    );
  },

  createPostComment: (
    courseId: string,
    postId: string,
    data: CreateCommentRequest
  ): Promise<CommentDto> => {
    return apiRequest<CommentDto>(`/courses/${courseId}/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePostComment: (
    courseId: string,
    postId: string,
    commentId: string,
    data: CreateCommentRequest
  ): Promise<CommentDto> => {
    return apiRequest<CommentDto>(
      `/courses/${courseId}/posts/${postId}/comments/${commentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  deletePostComment: (
    courseId: string,
    postId: string,
    commentId: string
  ): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};


export const solutionsService = {
  listSolutions: (
    courseId: string,
    postId: string,
    params?: { page?: number; size?: number; status?: SolutionStatus }
  ): Promise<PageSolutionDto> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest<PageSolutionDto>(
      `/courses/${courseId}/posts/${postId}/solutions${query ? `?${query}` : ''}`
    );
  },

  createSolution: (
    courseId: string,
    postId: string,
    data: CreateSolutionRequest
  ): Promise<SolutionDto> => {
    return apiRequest<SolutionDto>(`/courses/${courseId}/posts/${postId}/solutions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMySolution: (courseId: string, postId: string): Promise<SolutionDto> => {
    return apiRequest<SolutionDto>(`/courses/${courseId}/posts/${postId}/solutions/my`);
  },

  getSolution: (courseId: string, postId: string, solutionId: string): Promise<SolutionDto> => {
    return apiRequest<SolutionDto>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}`
    );
  },

  updateSolution: (
    courseId: string,
    postId: string,
    solutionId: string,
    data: CreateSolutionRequest
  ): Promise<SolutionDto> => {
    return apiRequest<SolutionDto>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  deleteSolution: (courseId: string, postId: string, solutionId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/solutions/${solutionId}`, {
      method: 'DELETE',
    });
  },

  gradeSolution: (
    courseId: string,
    postId: string,
    solutionId: string,
    data: GradeRequest
  ): Promise<SolutionDto> => {
    return apiRequest<SolutionDto>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/grade`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  listSolutionFiles: (
    courseId: string,
    postId: string,
    solutionId: string
  ): Promise<FileDto[]> => {
    return apiRequest<FileDto[]>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files`
    );
  },

  uploadSolutionFile: (
    courseId: string,
    postId: string,
    solutionId: string,
    file: File
  ): Promise<FileDto> => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFile<FileDto>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files`,
      formData
    );
  },

  deleteSolutionFile: (
    courseId: string,
    postId: string,
    solutionId: string,
    fileId: string
  ): Promise<void> => {
    return apiRequest<void>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files/${fileId}`,
      {
        method: 'DELETE',
      }
    );
  },

  downloadSolutionFile: (
    courseId: string,
    postId: string,
    solutionId: string,
    fileId: string
  ): Promise<Blob> => {
    return downloadFile(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/files/${fileId}/download`
    );
  },

  listSolutionComments: (
    courseId: string,
    postId: string,
    solutionId: string,
    params?: { page?: number; size?: number }
  ): Promise<PageCommentDto> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const query = queryParams.toString();
    return apiRequest<PageCommentDto>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments${
        query ? `?${query}` : ''
      }`
    );
  },

  createSolutionComment: (
    courseId: string,
    postId: string,
    solutionId: string,
    data: CreateCommentRequest
  ): Promise<CommentDto> => {
    return apiRequest<CommentDto>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  updateSolutionComment: (
    courseId: string,
    postId: string,
    solutionId: string,
    commentId: string,
    data: CreateCommentRequest
  ): Promise<CommentDto> => {
    return apiRequest<CommentDto>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments/${commentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  deleteSolutionComment: (
    courseId: string,
    postId: string,
    solutionId: string,
    commentId: string
  ): Promise<void> => {
    return apiRequest<void>(
      `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments/${commentId}`,
      {
        method: 'DELETE',
      }
    );
  },
};


export const membersService = {
  listMembers: (
    courseId: string,
    params?: { page?: number; size?: number; role?: CourseRole }
  ): Promise<PageMemberDto> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.role) queryParams.append('role', params.role);

    const query = queryParams.toString();
    return apiRequest<PageMemberDto>(
      `/courses/${courseId}/members${query ? `?${query}` : ''}`
    );
  },

  removeMember: (courseId: string, userId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};


export const invitesService = {
  listInvites: (courseId: string): Promise<InviteDto[]> => {
    return apiRequest<InviteDto[]>(`/courses/${courseId}/invites`);
  },

  createInvite: (courseId: string, data: CreateInviteRequest): Promise<InviteDto> => {
    return apiRequest<InviteDto>(`/courses/${courseId}/invites`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  revokeInvite: (courseId: string, inviteId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/invites/${inviteId}`, {
      method: 'DELETE',
    });
  },

  joinCourse: (code: string): Promise<CourseDto> => {
    return apiRequest<CourseDto>(`/invites/${code}/join`, {
      method: 'POST',
    });
  },
};
