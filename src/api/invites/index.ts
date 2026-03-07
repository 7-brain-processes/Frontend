import { listInvites } from './listInvites';
import { createInvite } from './createInvite';
import { revokeInvite } from './revokeInvite';

export { listInvites } from './listInvites';
export { createInvite } from './createInvite';
export { revokeInvite } from './revokeInvite';

export const invitesService = {
  listInvites,
  createInvite,
  revokeInvite,
};
