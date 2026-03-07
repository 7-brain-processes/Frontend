import { listMyCourses } from './listMyCourses';
import { createCourse } from './createCourse';
import { getCourse } from './getCourse';
import { updateCourse } from './updateCourse';
import { deleteCourse } from './deleteCourse';
import { leaveCourse } from './leaveCourse';

export { listMyCourses } from './listMyCourses';
export { createCourse } from './createCourse';
export { getCourse } from './getCourse';
export { updateCourse } from './updateCourse';
export { deleteCourse } from './deleteCourse';
export { leaveCourse } from './leaveCourse';
export { joinCourse } from './joinCourse';

export const coursesService = {
  listMyCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  leaveCourse,
};
