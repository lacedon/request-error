class RequestError extends Error {
  static statuses = {
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    conflict: 409,
    internalServerError: 500,
  };

  static create(message: string): RequestError;

  static create(message: string, details: RequestError | Error | string): RequestError;

  static create(message: string, status?: number, details?: Error | string): RequestError;

  static create(
    message: string,
    statusOrDetails?: RequestError | Error | string | number,
    details?: Error | string,
  ): RequestError {
    const requestError: RequestError | null = statusOrDetails instanceof RequestError ? statusOrDetails : null;
    if (requestError) {
      return requestError.wrap(message);
    }

    if (typeof statusOrDetails === 'number') {
      return new RequestError(message, statusOrDetails, details instanceof Error ? details.message : details);
    }

    return new RequestError(
      message,
      RequestError.statuses.badRequest,
      statusOrDetails instanceof Error ? statusOrDetails.message : statusOrDetails,
    );
  }

  static createFromError(error: RequestError | Error | string): RequestError {
    if (error instanceof RequestError) {
      return error.clone();
    }
    return RequestError.create(error instanceof Error ? error.message : error);
  }

  static unauthorized(message = 'Unauthorized', details?: RequestError | Error | string): RequestError {
    return RequestError.create(message, RequestError.statuses.unauthorized, details);
  }

  static forbidden(message: string, details?: RequestError | Error | string): RequestError {
    return RequestError.create(message, RequestError.statuses.forbidden, details);
  }

  static notFound(message: string, details?: RequestError | Error | string): RequestError {
    return RequestError.create(message, RequestError.statuses.notFound, details);
  }

  static conflict(message: string, details?: RequestError | Error | string): RequestError {
    return RequestError.create(message, RequestError.statuses.conflict, details);
  }

  static internalServerError(message: string, details?: RequestError | Error | string): RequestError {
    return RequestError.create(message, RequestError.statuses.internalServerError, details);
  }

  readonly status: number;

  readonly details: string | void;

  constructor(message: string, status: number = RequestError.statuses.badRequest, details: string | void = undefined) {
    super(message);

    this.status = status;
    this.details = details;
  }

  get fullMessage(): string {
    return [this.message, this.details].filter(Boolean).join(': ');
  }

  toJSON(): { [key: string]: string | number | void } {
    return { message: this.message, status: this.status, details: this.details };
  }

  toFullString(): string {
    return [`Error ${this.status}`, this.fullMessage].filter(Boolean).join(': ');
  }

  toString(): string {
    return [`Error ${this.status}`, this.message].filter(Boolean).join(': ');
  }

  private wrap(message: string): RequestError {
    return new RequestError(message, this.status, `${this.message}${this.details ? `: ${this.details}` : ''}`);
  }

  clone(): RequestError {
    return new RequestError(this.message, this.status, this.details);
  }
}

export default RequestError;
