import { UserDto } from './User';

export type PostType = 'MATERIAL' | 'TASK';

export interface PostDto {
  id: string;
  title: string;
  content: string;
  type: PostType;
  teamFormationMode: 'FREE' | 'DRAFT' | 'CAPTAIN_SELECTION' | 'RANDOM_SHUFFLE';
  teamRequirementTemplateId: string;
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
  teamFormationMode?: 'FREE' | 'DRAFT' | 'CAPTAIN_SELECTION' | 'RANDOM_SHUFFLE';
  teamRequirementTemplateId?: string;
  deadline?: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  deadline?: string;
  teamFormationMode?: 'FREE' | 'DRAFT' | 'CAPTAIN_SELECTION' | 'RANDOM_SHUFFLE';
}

export interface PagePostDto {
  content: PostDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
