import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { Empleado } from '../empleado/entities/empleado.entity';
import { AppRole, AuthenticatedUser } from './auth.types';

interface SessionPayload {
  sub: number;
  role: AppRole;
  exp: number;
}

const demoUsers: Record<string, { role: AppRole; nombre: string; apellido: string }> = {
  dueno123: { role: 'dueno', nombre: 'Dueño', apellido: 'Sistema' },
  gerente123: { role: 'gerente_sucursal', nombre: 'Gerente', apellido: 'Demo' },
  vendedor123: { role: 'vendedor', nombre: 'Vendedor', apellido: 'Demo' },
  contador123: { role: 'contador', nombre: 'Contador', apellido: 'Demo' },
  bodeguero123: { role: 'bodeguero', nombre: 'Bodeguero', apellido: 'Demo' },
};

@Injectable()
export class AuthService {
  private readonly cookieName = 'tienda_session';
  private roleColumnAvailable: boolean | null = null;

  constructor(
    @InjectRepository(Empleado) private readonly empleadoRepository: Repository<Empleado>,
    private readonly configService: ConfigService,
  ) {}

  private getSecret() {
    return this.configService.get<string>('AUTH_SESSION_SECRET') ?? 'dev-session-secret';
  }

  private resolveRole(rol: string | null | undefined, esGerente: boolean): AppRole {
    if (
      rol === 'dueno' ||
      rol === 'gerente_sucursal' ||
      rol === 'vendedor' ||
      rol === 'contador' ||
      rol === 'bodeguero'
    ) {
      return rol;
    }

    return esGerente ? 'gerente_sucursal' : 'vendedor';
  }

  private sign(payload: SessionPayload) {
    const payloadPart = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', this.getSecret()).update(payloadPart).digest('base64url');
    return `${payloadPart}.${signature}`;
  }

  private verify(token: string): SessionPayload | null {
    const [payloadPart, signature] = token.split('.');
    if (!payloadPart || !signature) return null;

    const expectedSignature = createHmac('sha256', this.getSecret()).update(payloadPart).digest('base64url');
    if (expectedSignature.length !== signature.length) return null;

    const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!valid) return null;

    try {
      const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as SessionPayload;
      if (!payload?.sub || !payload?.role || !payload?.exp) return null;
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;
      return payload;
    } catch {
      return null;
    }
  }

  private buildCookie(token: string) {
    const maxAge = 60 * 60 * 8;
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${this.cookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
  }

  private clearCookie() {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${this.cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
  }

  private getCookieToken(cookieHeader?: string) {
    if (!cookieHeader) return null;

    const cookie = cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${this.cookieName}=`));

    return cookie ? cookie.slice(this.cookieName.length + 1) : null;
  }

  private async hasRoleColumn() {
    if (this.roleColumnAvailable !== null) {
      return this.roleColumnAvailable;
    }

    const rows = await this.empleadoRepository.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'empleado' AND column_name = 'rol'
      ) AS exists`
    );

    this.roleColumnAvailable = Boolean(rows?.[0]?.exists);
    return this.roleColumnAvailable;
  }

  private async buildEmployeeQuery(id_empleado: number) {
    const hasRoleColumn = await this.hasRoleColumn();

    const query = this.empleadoRepository
      .createQueryBuilder('empleado')
      .leftJoin('empleado.sucursal', 'sucursal')
      .select('empleado.id_empleado', 'id_empleado')
      .addSelect('empleado.nombre', 'nombre')
      .addSelect('empleado.apellido', 'apellido')
      .addSelect('empleado.es_gerente', 'es_gerente')
      .addSelect('empleado.salario', 'salario')
      .addSelect('empleado.id_sucursal', 'id_sucursal')
      .addSelect('sucursal.nombre', 'nombre_sucursal')
      .where('empleado.id_empleado = :id_empleado', { id_empleado });

    if (hasRoleColumn) {
      query.addSelect('empleado.rol', 'rol');
    }

    return query;
  }

  private toUser(employee: Empleado & { nombre_sucursal?: string | null }): AuthenticatedUser {
    const role = this.resolveRole((employee as Empleado & { rol?: string }).rol, employee.es_gerente);

    return {
      id_empleado: Number(employee.id_empleado),
      nombre: employee.nombre,
      apellido: employee.apellido,
      salario: Number(employee.salario),
      id_sucursal: Number(employee.id_sucursal),
      nombre_sucursal: employee.nombre_sucursal ?? null,
      role,
      es_gerente: employee.es_gerente,
    };
  }

  async login(credential: string) {
    const trimmedCredential = credential.trim();
    const numericCredential = Number(trimmedCredential);

    if (trimmedCredential !== '' && Number.isFinite(numericCredential)) {
      const employee = await (await this.buildEmployeeQuery(numericCredential)).getRawOne<AuthenticatedUser & { rol?: string }>();

      if (!employee) {
        throw new UnauthorizedException('Carnet no encontrado');
      }

      const user = this.toUser(employee as Empleado & { nombre_sucursal?: string | null });
      const token = this.sign({
        sub: user.id_empleado,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      });

      return {
        user,
        cookie: this.buildCookie(token),
      };
    }

    const demoUser = demoUsers[trimmedCredential.toLowerCase()];
    if (!demoUser) {
      throw new UnauthorizedException('Credencial inválida');
    }

    const user: AuthenticatedUser = {
      id_empleado: 0,
      nombre: demoUser.nombre,
      apellido: demoUser.apellido,
      salario: 0,
      id_sucursal: 1,
      nombre_sucursal: 'Sucursal Demo',
      role: demoUser.role,
      es_gerente: demoUser.role === 'gerente_sucursal',
    };

    const token = this.sign({
      sub: user.id_empleado,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    });

    return {
      user,
      cookie: this.buildCookie(token),
    };
  }

  async me(cookieHeader?: string) {
    const token = this.getCookieToken(cookieHeader);
    if (!token) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    const payload = this.verify(token);
    if (!payload) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const employee = await (await this.buildEmployeeQuery(payload.sub)).getRawOne<AuthenticatedUser & { rol?: string }>();

    if (!employee) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.toUser(employee as Empleado & { nombre_sucursal?: string | null });
  }

  logout() {
    return {
      ok: true,
      cookie: this.clearCookie(),
    };
  }
}