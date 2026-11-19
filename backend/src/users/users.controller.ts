import { Controller, Get, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { Role } from 'src/generated/prisma/enums';

@UseInterceptors( ClassSerializerInterceptor )
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}


  @Auth( Role.admin )
  @Get()
  async findAll( @Query() pagination : PaginationQueryDto ) {

    const { data, meta } = await this.usersService.findAll( pagination ) ;

    return { data: data.map( (user) => new UserEntity( user ) ), meta }

  }



  @Auth( Role.admin, Role.sponsor, Role.user )
  @Get('me')
  async getMe( @CurrentUser() user : JwtPayload ) {

    const me = await this.usersService.findOne( user.sub )

    return new UserEntity( me )

  }


  @Auth( Role.admin, Role.sponsor, Role.user )
  @Patch('me')
  async updateMe( @CurrentUser() user : JwtPayload, @Body() updateUserDto : UpdateUserDto ) {

    const updatedUser = await this.usersService.update( user.sub, updateUserDto, user ) ;

    return new UserEntity( updatedUser )

  }


  @Auth( Role.admin )
  @Get(':id')
  async findOne( @Param('id', ParseUUIDPipe) id: string ) {

    const user = await this.usersService.findOne(id) ;

    return new UserEntity( user )

  }



  @Auth( Role.admin )
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id : string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user : JwtPayload
  ) {

    const userUpdate = await this.usersService.update( id, updateUserDto, user )

    return new UserEntity( userUpdate )

  }



  @Auth( Role.admin )
  @Delete(':id')
  async remove( @Param('id', ParseUUIDPipe) id : string ) {

    return await this.usersService.remove(id)

  }


}
