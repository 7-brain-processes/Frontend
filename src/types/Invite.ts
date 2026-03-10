import { CourseRole } from './Course';

export interface InviteDto {
  id: string;
  code: string;
  role: CourseRole;
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
}

export interface CreateInviteRequest {
  role: CourseRole;
  expiresAt?: string;
  maxUses?: number;
}
