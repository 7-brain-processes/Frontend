import { apiRequestPreserveErrors } from '../client';
import { TeamFormationStudentDto } from '../../types';

export const listCaptainAvailableStudents = (
  courseId: string,
  postId: string
): Promise<TeamFormationStudentDto[]> => {
  return apiRequestPreserveErrors<TeamFormationStudentDto[]>(
    `/courses/${courseId}/posts/${postId}/invitations/captain/students`
  );
};
