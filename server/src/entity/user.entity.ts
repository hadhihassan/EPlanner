export type Role = 'admin' | 'organizer' | 'participant';

export class User {
  constructor(
    public id: string | null,
    public name: string,
    public email: string,
    public role: Role = 'participant',
    public password?: string, 
  ) {}
}
