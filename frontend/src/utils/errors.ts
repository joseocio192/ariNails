export function getAxiosErrorMessage(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  // Narrow to an object shape that may come from axios without using `any`
  const maybe = err as { response?: { data?: { message?: unknown } } };
  const msg = maybe.response?.data?.message;
  if (typeof msg === 'string') return msg;
  return undefined;
}
