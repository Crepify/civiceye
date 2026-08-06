/** Is an email an Amrita address? (any campus, students + staff) */
export function isAmritaEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return domain.endsWith('amrita.edu');
}
