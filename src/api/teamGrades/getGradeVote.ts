import { apiRequestPreserveErrors } from '../client';
import { GradeVoteStatusDto } from '../../types';

export const getGradeVote = (
  courseId: string,
  postId: string
): Promise<GradeVoteStatusDto> => {
  return apiRequestPreserveErrors<GradeVoteStatusDto>(
    `/courses/${courseId}/posts/${postId}/grade-vote`
  );
};
