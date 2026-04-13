import { listCourseTeams } from './listCourseTeams';
import { createCourseTeam } from './createCourseTeam';
import { getMyTeam } from './getMyTeam';
import { enrollInTeam } from './enrollInTeam';
import { leaveTeam } from './leaveTeam';

export { listCourseTeams } from './listCourseTeams';
export { createCourseTeam } from './createCourseTeam';
export { getMyTeam } from './getMyTeam';
export { enrollInTeam } from './enrollInTeam';
export { leaveTeam } from './leaveTeam';

export const teamsService = {
  listCourseTeams,
  createCourseTeam,
  getMyTeam,
  enrollInTeam,
  leaveTeam,
};
