/**
 * API 에러 타입 및 핸들링 유틸리티
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "리소스를 찾을 수 없습니다") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = "유효하지 않은 요청입니다") {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "인증이 필요합니다") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    // 일반적인 에러 메시지 매핑
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "네트워크 연결을 확인해주세요";
    }
    if (error.message.includes("timeout")) {
      return "요청 시간이 초과되었습니다";
    }
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다";
}

/**
 * API 응답을 처리하고 에러를 던짐
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || "요청 처리 중 오류가 발생했습니다",
      response.status,
      errorData.code
    );
  }
  return response.json();
}

/**
 * 안전한 비동기 함수 실행 (에러 시 null 반환)
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("safeAsync error:", error);
    return fallback;
  }
}
