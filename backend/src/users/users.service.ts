import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { Role } from 'src/generated/prisma/enums';
import { hashingKey } from 'src/common/hashing/hash-bcrypt';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtPayload } from 'src/common/types/jwt-payload.type';


const SELECT_PUBLIC = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  companyName: true,
  logoUrl: true,
  website: true,
  createdAt: true,
  updatedAt: true
} as const


@Injectable()
export class UsersService {

  constructor( private readonly prismaORM : PrismaService ) {}


  async create( createUserDto : CreateUserDto ) {

    const existingUser = await this.prismaORM.user.findUnique(
      {
        where: {email: createUserDto.email},
        select: {id: true}
      }
    )

    if( existingUser ) throw new ConflictException( `User with email "${createUserDto.email}" is already registered` ) ;


    const hash = await hashingKey( createUserDto.password ) ;


    try{

      return await this.prismaORM.user.create(
        {
          data: {
            ...createUserDto,
            password: hash
          },
          select: SELECT_PUBLIC
        }
      )

    }
    catch( error ) {

      // Two signups with the same email can both pass the check above: the unique index is the last line of defense
      if( this.isUniqueViolation( error ) ) throw new ConflictException( `User with email "${createUserDto.email}" is already registered` ) ;

      throw error

    }

  }


  async findAll( { page, limit } : PaginationQueryDto ) {

    const [ data, total ] = await this.prismaORM.$transaction(
      [
        this.prismaORM.user.findMany(
          {
            select: SELECT_PUBLIC,
            orderBy: [ {createdAt: 'asc'}, {id: 'asc'} ],
            skip: (page - 1) * limit,
            take: limit
          }
        )
        ,
        this.prismaORM.user.count()
      ]
    )


    return { data, meta: {total, page, limit} }

  }


  async findOne( id : string ) {

    const user = await this.prismaORM.user.findUnique(
      {
        where: {id},
        select: SELECT_PUBLIC
      }
    )

    if( !user ) throw new NotFoundException('User not found') ;


    return user

  }


  // ⚠️ This one DOES bring the password: the signin needs it to compare with bcrypt
  findByEmailWithPassword( email : string ) {

    return this.prismaORM.user.findUnique(
      {
        where: {email}
      }
    )

  }


  // Internal use of the refresh token flow
  findByIdWithRefreshToken( id : string ) {

    return this.prismaORM.user.findUnique(
      {
        where: {id},
        select: {
          ...SELECT_PUBLIC,
          hashedRefreshToken: true
        }
      }
    )

  }


  // Stores bcrypt(sha256(refresh token)), or null to kill the session (logout / token reuse)
  async updateRefreshToken( userId : string, hashedRefreshToken : string | null ) {

    await this.prismaORM.user.update(
      {
        where: {id: userId},
        data: {hashedRefreshToken: hashedRefreshToken},
        select: {id: true}
      }
    )

  }


  async update( id : string, updateUserDto : UpdateUserDto, requester : JwtPayload ) {

    const isSelf = requester.sub === id ;

    const isAdmin = requester.role === Role.admin ;


    if( !isSelf && !isAdmin ) {

      throw new ForbiddenException('You can only edit your own profile')

    }


    await this.findOne(id) ;


    if( updateUserDto.email ) {

      const inUsing = await this.prismaORM.user.findUnique(
        {
          where: {email: updateUserDto.email},
          select: {id: true}
        }
      )

      if( inUsing && inUsing.id !== id ) throw new ConflictException('Already exist an user with that email') ;

    }


    const data : Prisma.UserUpdateInput = { ...updateUserDto } ;


    if( updateUserDto.password ) {

      data.password = await hashingKey( updateUserDto.password ) ;

      // A new password closes every open session
      data.hashedRefreshToken = null

    }


    try{

      return await this.prismaORM.user.update(
        {
          where: {id},
          data,
          select: SELECT_PUBLIC
        }
      )

    }
    catch( error ) {

      if( this.isUniqueViolation( error ) ) throw new ConflictException('Already exist an user with that email') ;

      throw error

    }

  }


  async remove( id : string ) {

    await this.findOne(id) ;


    try{

      await this.prismaORM.user.delete( { where: {id} } )

    }
    catch( error ) {

      // Projects, updates, collaborations and contributions keep a reference to their user (onDelete: Restrict)
      if( error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003' ) {

        throw new ConflictException('The user has related records and cannot be deleted')

      }

      throw error

    }


    return {message: `User #${id} has been deleted`}

  }


  private isUniqueViolation( error : unknown ) {

    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'

  }


}
