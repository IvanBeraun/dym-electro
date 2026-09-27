package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.ProveedorDao;
import com.dymelectro.dymelectro_backend.dto.proveedor.ProveedorDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProveedorService {

    private final ProveedorDao proveedorDao;

    public ProveedorService(ProveedorDao proveedorDao) {
        this.proveedorDao = proveedorDao;
    }

    public List<ProveedorDTO> listar() {
        return proveedorDao.listar();
    }
}