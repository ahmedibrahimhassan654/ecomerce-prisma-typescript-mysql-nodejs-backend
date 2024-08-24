import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env" });

export const PORT = process.env.PORT;
//! = it can't be undifined
export const JWT_SECRET = process.env.JWT_SECRET!;
