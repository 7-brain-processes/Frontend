import { listPosts } from './listPosts';
import { createPost } from './createPost';
import { getPost } from './getPost';
import { updatePost } from './updatePost';
import { deletePost } from './deletePost';
import { listPostMaterials } from './listPostMaterials';
import { uploadPostMaterial } from './uploadPostMaterial';
import { deletePostMaterial } from './deletePostMaterial';
import { downloadPostMaterial } from './downloadPostMaterial';
import { listPostComments } from './listPostComments';
import { createPostComment } from './createPostComment';
import { updatePostComment } from './updatePostComment';
import { deletePostComment } from './deletePostComment';
import { listAvailableTeams } from './listAvailableTeams';
import { createAssignmentTeam } from './createAssignmentTeam';

export { listPosts } from './listPosts';
export { createPost } from './createPost';
export { getPost } from './getPost';
export { updatePost } from './updatePost';
export { deletePost } from './deletePost';
export { listPostMaterials } from './listPostMaterials';
export { uploadPostMaterial } from './uploadPostMaterial';
export { deletePostMaterial } from './deletePostMaterial';
export { downloadPostMaterial } from './downloadPostMaterial';
export { listPostComments } from './listPostComments';
export { createPostComment } from './createPostComment';
export { updatePostComment } from './updatePostComment';
export { deletePostComment } from './deletePostComment';
export { listAvailableTeams } from './listAvailableTeams';
export { createAssignmentTeam } from './createAssignmentTeam';

export const postsService = {
  listPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  listPostMaterials,
  uploadPostMaterial,
  deletePostMaterial,
  downloadPostMaterial,
  listPostComments,
  createPostComment,
  updatePostComment,
  deletePostComment,
  listAvailableTeams,
  createAssignmentTeam,
};
