import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class SigninDto {

    // Same normalization as the signup, otherwise "Ana@x.com" could never log in
    @Transform( ( { value } : { value : unknown } ) => typeof value === 'string'  ?  value.trim().toLowerCase()  :  value )
    @IsEmail( {}, {message: "The email format is not valid"} )
    email! : string

    @IsString()
    @IsNotEmpty({message: "The password is required"})
    password! : string

}
