export interface CheckTarget {
  url: string;
  expectedStatusCode: number;
}

export interface CheckResult {
  httpStatus: number | null;
  responseTimeMs: number;
  success: boolean;
  errorMessage: string | null;
}

const CHECK_TIMEOUT_MS = 10_000;

export async function runCheck(target: CheckTarget): Promise<CheckResult> {
  const startedAt = performance.now();

  try {
    const response = await fetch(target.url, {
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });

    return {
      httpStatus: response.status,
      responseTimeMs: Math.round(performance.now() - startedAt),
      success: response.status === target.expectedStatusCode,
      errorMessage: null,
    };
  } catch (error) {
    return {
      httpStatus: null,
      responseTimeMs: Math.round(performance.now() - startedAt),
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
