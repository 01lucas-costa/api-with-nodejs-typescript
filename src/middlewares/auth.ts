import { Request, Response, NextFunction } from 'express'
import AuthService from '@src/services/auth'

export function authMiddleware(
   req: Partial<Request>, 
   res: Partial<Response>, 
   next: NextFunction
): void {
   try {
      const token = req.headers?.['x-access-token']
      const decoded = AuthService.decodedToken(token as string)
      req.decoded = decoded
      next()
   } catch(error) {
      res.status?.(401).send({ code: 401, error: error.message })
   }
}