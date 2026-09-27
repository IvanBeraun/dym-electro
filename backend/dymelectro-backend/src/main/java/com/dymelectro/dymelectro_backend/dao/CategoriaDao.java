package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.categoria.CategoriaDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CategoriaDao {

    private final JdbcProcedureSupport jdbc;

    public CategoriaDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<CategoriaDTO> MAPPER = (rs, i) -> new CategoriaDTO(
            rs.getInt("id_categoria"), rs.getString("nombre"), rs.getString("descripcion"), rs.getBoolean("estado")
    );

    public List<CategoriaDTO> listar() {
        return jdbc.queryForList("{call sp_listar_categorias()}", MAPPER);
    }
}