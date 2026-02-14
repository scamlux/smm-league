import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => {
  // Убедимся, что roles это массив строк
  const validRoles = roles.filter((role) =>
    ["BRAND", "INFLUENCER", "ADMIN"].includes(role),
  );
  return SetMetadata(ROLES_KEY, validRoles);
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если роли не указаны, разрешаем доступ
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Required roles: ${requiredRoles.join(", ")}`,
        },
      });
    }

    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== "ADMIN") {
      throw new ForbiddenException("Only admins can access this resource");
    }

    return true;
  }
}
