/**
 * Schnittstelle für einen Kontakt.
 */
export interface Contact {
  /** Eindeutige Identifikationsnummer des Kontakts. */
  id: number;

  /** Vollständiger Name des Kontakts. */
  name: string;

  /** E-Mail-Adresse des Kontakts. */
  email: string;

  /** Telefonnummer des Kontakts. */
  phone: string;
}
