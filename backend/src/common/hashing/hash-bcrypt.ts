import * as bcrypt from 'bcrypt' ;


export const hashingKey = async ( key : string ) => {

    const salt = await bcrypt.genSalt(10) ;

    return await bcrypt.hash( key, salt )

}


// return Promise<boolean>
export const checkTheRespectiveKey = async ( inputKey : string, respectiveRegisteredKey : string ) => {

    return await bcrypt.compare( inputKey, respectiveRegisteredKey )

}
