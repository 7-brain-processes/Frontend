import { apiRequestPreserveErrors } from '../client';
import { MyTeamGradeDto } from '../../types/TeamGrade';

export const getMyTeamGrade = (
  courseId: string,
  postId: string
): Promise<MyTeamGradeDto> => {
  return apiRequestPreserveErrors<MyTeamGradeDto>(
    `/courses/${courseId}/posts/${postId}/my-team-grade`
  );
};
