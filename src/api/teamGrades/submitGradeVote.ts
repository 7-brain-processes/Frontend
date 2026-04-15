import { apiRequestPreserveErrors } from '../client';
import { GradeVoteStatusDto, SubmitGradeVoteRequest } from '../../types';

export const submitGradeVote = (
  courseId: string,
  postId: string,
  data: SubmitGradeVoteRequest
): Promise<GradeVoteStatusDto> => {
  return apiRequestPreserveErrors<GradeVoteStatusDto>(
    `/courses/${courseId}/posts/${postId}/grade-vote`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};
