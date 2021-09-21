export class JsonApiException extends Error {
  constructor(statusCode, errors, ...args) {
    super(...args);
    this.statusCode = statusCode;
    this.errors = errors.map((error) => new JsonApiError(error));
    this.message = this.errors.map((error) => error.toString()).join(', ');

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JsonApiException);
    }

    this.name = 'JsonApiException';
  }
}

class JsonApiError {
  constructor({ status, code, title, detail, source = null }) {
    this.status = status;
    this.code = code;
    this.title = title;
    this.detail = detail;
    this.source = source;
  }

  toString() {
    return `<JsonApiError: ${this.status} - ${this.detail}> `;
  }
}

export class NotSingleItem extends Error {}
export class DoesNotExist extends NotSingleItem {}
export class MultipleObjectsReturned extends NotSingleItem {}
