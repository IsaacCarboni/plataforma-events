export class UserDTO {
  constructor(user = {}) {
    this.id = user._id?.toString() || user.id || null;
    this.first_name = user.first_name ?? '';
    this.last_name = user.last_name ?? '';
    this.full_name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    this.email = user.email ?? '';
    this.role = user.role ?? 'user';
    this.age = user.age ?? null;
    
    // 🛑 Jamás expone hash de password, salt o tokens de recuperación
  }
}