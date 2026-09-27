package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.ClienteDao;
import com.dymelectro.dymelectro_backend.dto.cliente.ClienteDTO;
import com.dymelectro.dymelectro_backend.dto.cliente.EditarClienteRequest;
import com.dymelectro.dymelectro_backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ClienteService {

    private final ClienteDao clienteDao;

    public ClienteService(ClienteDao clienteDao) {
        this.clienteDao = clienteDao;
    }

    public void editar(Integer idCliente, EditarClienteRequest req) {
        clienteDao.editarCliente(idCliente, req.nombres(), req.apellidos(), req.telefono(), req.direccion());
    }

    public ClienteDTO obtenerPorEmail(String email) {
        return clienteDao.obtenerPorEmail(email)
                .map(ClienteDao::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
    }

    public java.util.List<ClienteDTO> listarTodos() {
        return clienteDao.listarClientes();
    }
}
