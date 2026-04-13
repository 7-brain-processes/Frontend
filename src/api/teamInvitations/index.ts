import { listCaptainAvailableStudents } from './listCaptainAvailableStudents';
import { sendCaptainInvitation } from './sendCaptainInvitation';
import { getCaptainTeam } from './getCaptainTeam';
import { listStudentInvitations } from './listStudentInvitations';
import { respondToTeamInvitation } from './respondToTeamInvitation';

export { listCaptainAvailableStudents } from './listCaptainAvailableStudents';
export { sendCaptainInvitation } from './sendCaptainInvitation';
export { getCaptainTeam } from './getCaptainTeam';
export { listStudentInvitations } from './listStudentInvitations';
export { respondToTeamInvitation } from './respondToTeamInvitation';

export const teamInvitationsService = {
  listCaptainAvailableStudents,
  sendCaptainInvitation,
  getCaptainTeam,
  listStudentInvitations,
  respondToTeamInvitation,
};
