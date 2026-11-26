const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i ;


// The API answers 400 to an id that is not a uuid. Pages check it first and show a normal 404 instead
export function isUuid ( value : string ) : boolean {

    return UUID_PATTERN.test( value ) ;

}
