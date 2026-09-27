package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.MarcaDao;
import com.dymelectro.dymelectro_backend.dto.marca.MarcaDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarcaService {

    private final MarcaDao marcaDao;

    public MarcaService(MarcaDao marcaDao) {
        this.marcaDao = marcaDao;
    }

    public List<MarcaDTO> listar() {
        return marcaDao.listar();
    }
}