export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, "NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends HttpError {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(400, "BAD_REQUEST", message);
    this.name = "BadRequestError";
  }
}
