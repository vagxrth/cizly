import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const middleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization') ?? "";
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  if (decoded.userId) {
    req.userId = decoded.userId;
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default middleware;

