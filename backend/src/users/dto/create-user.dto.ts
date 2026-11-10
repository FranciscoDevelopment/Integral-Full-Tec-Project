import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { passwordRegex } from 'src/common/regex/some-regex';
import { Role } from 'src/generated/prisma/enums';


const trim = ( { value } : { value : unknown } ) => typeof value === 'string'  ?  value.trim()  :  value ;

// "Ana@x.com" and "ana@x.com" must be the same account
const normalizeEmail = ( { value } : { value : unknown } ) => typeof value === 'string'  ?  value.trim().toLowerCase()  :  value ;


export class CreateUserDto {

    @Transform( normalizeEmail )
    @IsEmail( {}, {message: "Email is not in a valid format."} )
    @MaxLength( 254, {message: "The email is too long"} )
    email! : string


    @IsString()
    @MinLength( 8, {message: "The password must be at least 8 characters long"} )
    @MaxLength( 72, {message: "The password is too long"} )
    @Matches( passwordRegex, {message: "The password must contain uppercase letters, lowercase letters, and numbers."} )
    password! : string


    @Transform( trim )
    @IsString()
    @MinLength(2, {message: 'The name must contain at least 2 characters'})
    @MaxLength(50, {message: 'The name is too long'})
    name !: string;


    // Public signup can only create "user" or "sponsor": an admin is never created from outside
    @IsOptional()
    @IsIn( [Role.user, Role.sponsor], {message: "The role must be user or sponsor"} )
    role? : typeof Role.user | typeof Role.sponsor


    // Required for sponsors; for everyone else optional, but validated when it comes
    @ValidateIf( ( dto : CreateUserDto ) => dto.role === Role.sponsor || dto.companyName !== undefined )
    @Transform( trim )
    @IsString()
    @IsNotEmpty( {message: "The company name is required for sponsors"} )
    @MaxLength( 100, {message: "The company name is too long"} )
    companyName? : string


    @IsOptional()
    @IsUrl( {require_protocol: true}, {message: "The logo must be a valid URL"} )
    @MaxLength( 2048, {message: "The logo URL is too long"} )
    logoUrl? : string


    @IsOptional()
    @IsUrl( {require_protocol: true}, {message: "The website must be a valid URL"} )
    @MaxLength( 2048, {message: "The website URL is too long"} )
    website? : string

}
