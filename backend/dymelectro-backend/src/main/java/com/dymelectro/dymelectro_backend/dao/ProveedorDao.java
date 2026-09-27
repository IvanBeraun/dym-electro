package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.proveedor.ProveedorDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProveedorDao {

    private final JdbcProcedureSupport jdbc;

    public ProveedorDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ProveedorDTO> MAPPER = (rs, i) -> new ProveedorDTO(
            rs.getInt("id_proveedor"), rs.getString("ruc"), rs.getString("razon_social"),
            rs.getString("telefono"), rs.getString("direccion"), rs.getString("email"),
            rs.getTimestamp("fecha_registro") != null ? rs.getTimestamp("fecha_registro").toLocalDateTime() : null
    );

    public List<ProveedorDTO> listar() {
        return jdbc.queryForList("{call sp_listar_proveedores()}", MAPPER);
    }
}