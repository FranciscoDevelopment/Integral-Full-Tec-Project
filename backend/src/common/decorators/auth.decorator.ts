import { applyDecorators } from "@nestjs/common";
import { Role } from "src/generated/prisma/enums";
import { Roles } from "./roles.decorator";

export function Auth( ...roles : Role[] ) {

    return applyDecorators( Roles( ...roles ) )

}
