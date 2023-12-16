export const UNAUTHORIZED_STATUS = 401;
export class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}