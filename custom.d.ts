import { IUser } from '@quo-pro/commons';

declare global {
    namespace Express {
        export interface Request {
            user: IUser;
        }
    }
}