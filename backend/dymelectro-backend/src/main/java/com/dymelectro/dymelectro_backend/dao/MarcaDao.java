package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.marca.MarcaDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MarcaDao {

    private final JdbcProcedureSupport jdbc;

    public MarcaDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<MarcaDTO> MAPPER = (rs, i) -> new MarcaDTO(
            rs.getInt("id_marca"), rs.getString("nombre"), rs.getString("descripcion"), rs.getBoolean("estado")
    );

    public List<MarcaDTO> listar() {
        return jdbc.queryForList("{call sp_listar_marcas()}", MAPPER);
    }
}