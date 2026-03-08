import { UserDto } from './User';

export interface CommentDto {
  id: string;
  text: string;
  author: UserDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentRequest {
  text: string;
}

export interface PageCommentDto {
  content: CommentDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
