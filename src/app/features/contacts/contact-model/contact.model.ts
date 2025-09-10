/**
 * @description Represents a contact with basic information.
 */
export interface Contact {
  /**
   * @description The avatar color of the contact.
   */
  color: string
  /**
   * @description The initials of the contact.
   */;
  initials: string
  /**
   * @description Unique identifier of the contact.
   * Optional, as it is usually assigned when saving to a database.
   */;
  id?: string
  /**
   * @description The name of the contact.
   */;

  name: string
  /**
   * @description The email address of the contact.
   */;

  email: string
  /**
   * @description The phone number of the contact.
   */;

  phone: string
  /**
   * @description The creation timestamp of the contact.
   * Optional, usually set automatically.
   */;

  createdAt?: Date
  /**
   * @description The last update timestamp of the contact.
   * Optional, usually updated automatically.
   */;

  updatedAt?: Date;
}
