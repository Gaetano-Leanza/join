// contact.model.ts
export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}