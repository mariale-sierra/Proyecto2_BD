import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { Cliente } from './entities/cliente.entity';
import { ClienteRepository } from './cliente.repository';

@Module({
  controllers: [ClienteController],
  providers: [ClienteService, ClienteRepository],
})
export class ClienteModule {}
