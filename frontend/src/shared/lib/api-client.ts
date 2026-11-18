const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";


type HttpMethodT = "GET" | "POST" | "PATCH" | "DELETE" ;

type QueryT = Record< string, string | number | boolean | null | undefined > ;

// Mirror of the error body the API sends on any failure
type ApiErrorBodyT = {
    statusCode? : number ;
    message? : string | string[] ;
}

type RequestOptionsT = {
    query? : QueryT ;
    body? : object ;
    signal? : AbortSignal ;
}


export class ApiError extends Error {

    constructor(
        public readonly status : number,
        message : string,
        // One entry per failed validation rule on a 400: handy to show under each form field
        public readonly details : string[] = [],
    ) {

        super( message ) ;

        this.name = "ApiError" ;

    }

}


// The API rotates the refresh token, so two parallel refreshes look like a token reuse
// and the API closes the whole session: only one refresh can be in flight at a time
let refreshInFlight : Promise<boolean> | null = null ;

const NO_REFRESH_PATHS = [ "/auth/signin", "/auth/signup", "/auth/refresh", "/auth/logout" ] ;


function buildUrl ( path : string, query? : QueryT ) : string {

    const params = new URLSearchParams() ;


    for( const [ key, value ] of Object.entries( query ?? {} ) ) {

        if( value !== undefined && value !== null && value !== "" ) params.set( key, String( value ) ) ;

    }


    const search = params.toString() ;

    const url = `${API_BASE_URL.replace( /\/+$/, "" )}${path}` ;


    return search  ?  `${url}?${search}`  :  url ;

}


async function toApiError ( response : Response ) : Promise<ApiError> {

    let body : ApiErrorBodyT = {} ;


    try{

        body = ( await response.json() ) as ApiErrorBodyT ;

    }
    catch {

        // Not JSON: the generic message below is used

    }


    const details = Array.isArray( body.message )  ?  body.message  :  [] ;

    const message = typeof body.message === "string"  ?  body.message  :  details.join( ", " ) ;


    return new ApiError( response.status, message || `The API request failed with status ${response.status}.`, details ) ;

}


async function send ( path : string, method : HttpMethodT, options : RequestOptionsT ) {

    const { query, body, signal } = options ;


    try{

        return await fetch( buildUrl( path, query ), {

            method,
            credentials: "include", // the session lives in httpOnly cookies
            headers: {
                Accept: "application/json",
                // Content-Type only with a body: on a GET it would force a CORS preflight
                ...( body === undefined  ?  {}  :  { "Content-Type": "application/json" } )
            },
            body: body === undefined  ?  undefined  :  JSON.stringify( body ),
            signal

        } ) ;

    }
    catch( error ) {

        if( error instanceof DOMException && error.name === "AbortError" ) throw error ;

        throw new ApiError( 0, "Unable to reach the API." ) ;

    }

}


function refreshSession () : Promise<boolean> {

    refreshInFlight ??= send( "/auth/refresh", "POST", {} )

        .then( response => response.ok )
        .catch( () => false )
        .finally( () => {

            refreshInFlight = null ;

        } ) ;


    return refreshInFlight ;

}


async function apiRequest<T> ( path : string, method : HttpMethodT, options : RequestOptionsT = {} ) : Promise<T> {

    let response = await send( path, method, options ) ;


    // Expired access token: refresh once and retry once
    if( response.status === 401 && !NO_REFRESH_PATHS.includes( path ) && ( await refreshSession() ) ) {

        response = await send( path, method, options ) ;

    }


    if( !response.ok ) throw await toApiError( response ) ;

    if( response.status === 204 ) return undefined as T ;


    return ( await response.json() ) as T ;

}


export const apiGet = <T>( path : string, query? : QueryT, signal? : AbortSignal ) => apiRequest<T>( path, "GET", { query, signal } ) ;

export const apiPost = <T>( path : string, body? : object ) => apiRequest<T>( path, "POST", { body } ) ;

export const apiPatch = <T>( path : string, body : object ) => apiRequest<T>( path, "PATCH", { body } ) ;

export const apiDelete = ( path : string ) => apiRequest<void>( path, "DELETE" ) ;


// Spanish copy for the UI. 400 and 409 show what the API says (it comes in English)
export function getErrorMessage ( error : unknown ) : string {

    if( !( error instanceof ApiError ) ) return "Ocurrió un error inesperado." ;


    if( error.status === 0 ) return "No se pudo conectar con el servidor." ;

    if( error.status === 401 ) return "Tu sesión venció. Volvé a ingresar." ;

    if( error.status === 403 ) return "No tenés permiso para hacer esto." ;

    if( error.status === 404 ) return "No encontramos lo que buscás." ;

    if( error.status >= 500 ) return "Algo salió mal en el servidor. Probá de nuevo en un rato." ;


    return error.details.length > 0  ?  error.details.join( ". " )  :  error.message ;

}
