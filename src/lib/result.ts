export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = undefined> =
  { ok: true; data: T; message?: string } | { ok: false; error: string; fieldErrors?: FieldErrors };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(
  error: string,
  fieldErrors?: FieldErrors,
): { ok: false; error: string; fieldErrors?: FieldErrors } {
  return { ok: false, error, fieldErrors };
}
