import { runAutoTeamFormation } from './runAutoTeamFormation';
import { getAutoFormationResult } from './getAutoFormationResult';
import { listAutoFormationStudents } from './listAutoFormationStudents';
import { selectCaptains } from './selectCaptains';
import { listCaptains } from './listCaptains';

export { runAutoTeamFormation } from './runAutoTeamFormation';
export { getAutoFormationResult } from './getAutoFormationResult';
export { listAutoFormationStudents } from './listAutoFormationStudents';
export { selectCaptains } from './selectCaptains';
export { listCaptains } from './listCaptains';

export const teamFormationService = {
  runAutoTeamFormation,
  getAutoFormationResult,
  listAutoFormationStudents,
  selectCaptains,
  listCaptains,
};
