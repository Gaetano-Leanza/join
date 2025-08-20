// contact.model.ts

/**
 * Repräsentiert einen Kontakt mit grundlegenden Informationen.
 */
export interface Contact {
color: any;
initials: any;
  /**
   * Eindeutige Kennung des Kontakts.
   * Optional, da sie z.B. erst beim Speichern in einer Datenbank vergeben wird.
   */
  id?: string;

  /**
   * Name des Kontakts.
   */
  name: string;

  /**
   * E-Mail-Adresse des Kontakts.
   */
  email: string;

  /**
   * Telefonnummer des Kontakts.
   */
  phone: string;

  /**
   * Zeitpunkt der Erstellung des Kontakts.
   * Optional, wird meist automatisch gesetzt.
   */
  createdAt?: Date;

  /**
   * Zeitpunkt der letzten Aktualisierung des Kontakts.
   * Optional, wird meist automatisch aktualisiert.
   */
  updatedAt?: Date;
}
