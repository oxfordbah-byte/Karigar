// Pani Undo uses mobile-number login instead of email, for both customers and
// workers. Supabase Auth's password-based flow still needs an "email" under
// the hood, so we derive a stable, hidden one from the normalized Indian
// mobile number. The real phone number is kept in user_metadata for display.
// Customers and workers use different hidden-email domains so the same
// phone number can never collide between the two account types.

export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let national: string;
  if (digits.length === 12 && digits.startsWith("91")) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    return null;
  }
  if (!/^[6-9]\d{9}$/.test(national)) return null;
  return national;
}

export function phoneToAuthEmail(nationalNumber: string): string {
  return `91${nationalNumber}@phone.paniundo.in`;
}

export function phoneToWorkerAuthEmail(nationalNumber: string): string {
  return `91${nationalNumber}@worker.paniundo.in`;
}
