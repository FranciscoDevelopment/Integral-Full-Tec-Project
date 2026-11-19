import { Exclude } from "class-transformer";
import { Role, UserStatus } from "src/generated/prisma/enums";


export class UserEntity {

    id! : string

    name! : string ;

    email! : string ;

    role! : Role ;

    status! : UserStatus ;

    companyName! : string | null ;

    logoUrl! : string | null ;

    website! : string | null ;

    createdAt! : Date ;

    updatedAt! : Date


    @Exclude()
    password? : string ;

    @Exclude()
    hashedRefreshToken? : string | null;


    constructor( partial : Partial< UserEntity > ) {

        Object.assign( this, partial )

    }

}
