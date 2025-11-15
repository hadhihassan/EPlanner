import { AxiosError } from "axios";

export const getErrorMessage = (err: unknown): string => {
  // 1. AxiosError (most common)
  if (err instanceof AxiosError) {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong. Please try again."
    );
  }

  // 2. Native JS Error
  if (err instanceof Error) {
    return err?.message || "Something went wrong.";
  }

  // 3. Any object thrown from RTK rejectWithValue or backend
  if (err && typeof err === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as Record<string, any>;
    return (
      e?.message ||
      e?.error ||
      e?.msg ||
      e?.detail ||
      e?.data?.message ||
      e?.data?.error ||
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      "Something went wrong."
    );
  }

  // 4. If it's a simple string
  if (typeof err === "string") {
    return err;
  }

  // 5. Anything else
  return "Something went wrong.";
};
