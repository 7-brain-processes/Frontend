import { UserDto } from './User';

export type PostType = 'MATERIAL' | 'TASK';

export interface PostDto {
  id: string;
  title: string;
  content: string;
  type: PostType;
  deadline: string | null;
  author: UserDto;
  materialsCount: number;
  commentsCount: number;
  solutionsCount?: number;
  mySolutionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content?: string;
  type: PostType;
  deadline?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  deadline?: string;
}

export interface PagePostDto {
  content: PostDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
