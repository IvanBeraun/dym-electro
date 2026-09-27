package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.cliente.ClienteDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class ClienteDao {

    private final JdbcProcedureSupport jdbc;

    public ClienteDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ClienteAuthData> AUTH_MAPPER = (rs, i) -> new ClienteAuthData(
            rs.getInt("id_cliente"),
            rs.getString("tipo_documento"),
            rs.getString("numero_documento"),
            rs.getString("nombres"),
            rs.getString("apellidos"),
            rs.getString("email"),
            rs.getString("password"),
            rs.getString("telefono"),
            rs.getString("direccion"),
            rs.getBoolean("estado"),
            rs.getInt("intentos_fallidos"),
            rs.getTimestamp("bloqueado_hasta") != null ? rs.getTimestamp("bloqueado_hasta").toLocalDateTime() : null
    );
    private static final RowMapper<ClienteDTO> LISTADO_MAPPER = (rs, i) -> new ClienteDTO(
            rs.getInt("id_cliente"),
            rs.getString("tipo_documento"),
            rs.getString("numero_documento"),
            rs.getString("nombres"),
            rs.getString("apellidos"),
            rs.getString("email"),
            rs.getString("telefono"),
            rs.getString("direccion"),
            rs.getBoolean("estado"),
            rs.getTimestamp("fecha_registro") != null ? rs.getTimestamp("fecha_registro").toLocalDateTime() : null
    );

    public Integer registrarCliente(String tipoDocumento, String numeroDocumento, String nombres, String apellidos,
                                     String email, String passwordHash, String telefono, String direccion) {
        RowMapper<Integer> idMapper = (rs, i) -> rs.getInt("id_cliente");
        return jdbc.queryForOptional("{call sp_registrar_cliente(?,?,?,?,?,?,?,?)}", idMapper,
                tipoDocumento, numeroDocumento, nombres, apellidos, email, passwordHash, telefono, direccion)
                .orElseThrow();
    }

    public void editarCliente(Integer idCliente, String nombres, String apellidos, String telefono, String direccion) {
        jdbc.execute("{call sp_editar_cliente(?,?,?,?,?)}", idCliente, nombres, apellidos, telefono, direccion);
    }

    public Optional<ClienteAuthData> obtenerPorEmail(String email) {
        return jdbc.queryForOptional("{call sp_obtener_cliente_por_email(?)}", AUTH_MAPPER, email);
    }

    public void registrarFalloLogin(String email) {
        jdbc.execute("{call sp_registrar_fallo_login_cliente(?)}", email);
    }

    public void loginExitoso(String email) {
        jdbc.execute("{call sp_login_exitoso_cliente(?)}", email);
    }

    public static ClienteDTO toDto(ClienteAuthData a) {
        return new ClienteDTO(a.idCliente(), a.tipoDocumento(), a.numeroDocumento(), a.nombres(), a.apellidos(),
                a.email(), a.telefono(), a.direccion(), a.estado(), null);
    }

    public java.util.List<ClienteDTO> listarClientes() {
        return jdbc.queryForList("{call sp_listar_clientes()}", LISTADO_MAPPER);
    }
}
