package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.CategoriaDao;
import com.dymelectro.dymelectro_backend.dto.categoria.CategoriaDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaDao categoriaDao;

    public CategoriaService(CategoriaDao categoriaDao) {
        this.categoriaDao = categoriaDao;
    }

    public List<CategoriaDTO> listar() {
        return categoriaDao.listar();
    }
}