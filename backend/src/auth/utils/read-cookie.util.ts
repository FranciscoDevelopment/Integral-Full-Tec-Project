import { Request } from 'express';

export const readCookie = ( request : Request, name : string ) => {

    const cookies = request.cookies as Record<string, unknown> | undefined ;

    const cookie = cookies?.[name]


    return typeof cookie === 'string'  ?  cookie  :  undefined

}
