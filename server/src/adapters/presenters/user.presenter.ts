import { User } from '../../entity/user.entity.js';

export const presentUser = (u: User) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});
