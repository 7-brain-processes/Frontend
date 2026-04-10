import { apiRequestPreserveErrors } from '../client';
import { TeamFormationStudentDto } from '../../types';

export const listAutoFormationStudents = (
  courseId: string,
  postId: string
): Promise<TeamFormationStudentDto[]> => {
  return apiRequestPreserveErrors<TeamFormationStudentDto[]>(
    `/courses/${courseId}/posts/${postId}/team-formation/auto/students`
  );
};
