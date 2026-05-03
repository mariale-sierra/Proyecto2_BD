import { Injectable } from '@nestjs/common';  
import { CreateClienteDto } from './dto/create-cliente.dto';
import {ClienteRepository} from "./cliente.repository";

@Injectable()
export class ClienteService {
  constructor(private clienteRepo: ClienteRepository) {}
  async findAll() {
    return this.clienteRepo.findAll();
  }

  async findByNit(nit: string) {
    return this.clienteRepo.findByNit(nit);
  }

  async findFrecuentes() {
    return this.clienteRepo.findFrecuentes();
  }

  async create(dto: CreateClienteDto) {
    const existe = await this.clienteRepo.findByNit(dto.nit);
    if (existe) {
      return {ok: false, mensaje: `Este NIT ya está registrado`};
    }
    const cliente = await this.clienteRepo.create(dto.nombre, dto.telefono, dto.correo, dto.nit);
    return {ok:true, cliente};
  }

  async update(id:number, dto:CreateClienteDto){
    const existe = await this.clienteRepo.findByNit(dto.nit);
    if (existe && existe.id_cliente !== id) {
      return{ok: false, mensaje: `Este NIT ya está registrado`};
    }
    const cliente = await this.clienteRepo.update(id, dto.nombre, dto.telefono, dto.correo, dto.nit);
    if (!cliente) return {ok: false, mensaje: `Cliente no encontrado`};
    return {ok:true, cliente};
  }

  async delete(id:number) {
    const existe = await this.clienteRepo.findByNit(id.toString());
    if (!existe) {
      return {ok: false, mensaje: `Cliente no encontrado`};
    }
    await this.clienteRepo.delete(id);
    return {ok:true};
  }
}
