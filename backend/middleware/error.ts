
import { NextFunction, Request, Response } from "express";

export class StatusCodeError extends Error {
    status: number;
    constructor(status: number, msg: string, options?: ErrorOptions) {
        super(msg, options);
        this.status = status;
    }
}

export class BadRequestError extends StatusCodeError {
    constructor(msg: string, options?: ErrorOptions) {
        super(400, msg, options);
    }
}

export function handleErrorsJson(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof StatusCodeError) {
        res.status(err.status).send({ error: err.message });
    } else {
        next(err);
    }
}
