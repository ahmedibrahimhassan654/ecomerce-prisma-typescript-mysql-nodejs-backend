import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../exceptions/ErrorResponse";
interface AuthenticatedRequest extends Request {
  user?: any;
}
export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorResponse("Access denied", 403));
    }
    next();
  };
};
