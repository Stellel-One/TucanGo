export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly codigo: string;

  constructor(message: string, statusCode: number = 400, codigo: string = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.codigo = codigo;
  }

  public get statusHttp(): number {
    return this.statusCode;
  }
}

export class CredencialesInvalidasError extends AuthError {
  constructor(message: string = "Credenciales inválidas.") {
    super(message, 401, "CREDENCIALES_INVALIDAS");
    this.name = "CredencialesInvalidasError";
  }
}

export class NoAutenticadoError extends AuthError {
  constructor(message: string = "Sesión no autenticada o expirada.") {
    super(message, 401, "NO_AUTENTICADO");
    this.name = "NoAutenticadoError";
  }
}

export class AccesoDenegadoError extends AuthError {
  constructor(message: string = "Acceso denegado: permisos insuficientes.") {
    super(message, 403, "ACCESO_DENEGADO");
    this.name = "AccesoDenegadoError";
  }
}

export class ValidacionError extends AuthError {
  constructor(message: string) {
    super(message, 422, "VALIDACION_FALLIDA");
    this.name = "ValidacionError";
  }
}

export class DemasiadasPeticionesError extends AuthError {
  public readonly retryAfterSegundos: number;

  constructor(segundos: number = 60, message: string = `Demasiados intentos. Intenta en ${segundos} segundos.`) {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "DemasiadasPeticionesError";
    this.retryAfterSegundos = segundos;
  }
}

export class CuerpoExcesivoError extends AuthError {
  constructor(message: string = "El cuerpo de la solicitud excede el límite permitido (64 KB).") {
    super(message, 413, "PAYLOAD_TOO_LARGE");
    this.name = "CuerpoExcesivoError";
  }
}
