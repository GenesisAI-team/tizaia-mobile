/**
 * Errores de aplicación con código estable y estado HTTP asociado. El envolvente
 * JSON se construye en la capa HTTP a partir de estas clases.
 */
export class AppError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
    public readonly details: readonly string[] = [],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  public constructor(
    message = 'Recurso no encontrado',
    details: readonly string[] = [],
  ) {
    super('NOT_FOUND', message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  public constructor(
    message = 'Solicitud no válida',
    details: readonly string[] = [],
  ) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NonSchoolDayError extends AppError {
  public constructor(date: string) {
    super('NON_SCHOOL_DAY', `La fecha ${date} no es un día lectivo`, 409, [
      `Fecha no lectiva: ${date}`,
    ]);
    this.name = 'NonSchoolDayError';
  }
}
