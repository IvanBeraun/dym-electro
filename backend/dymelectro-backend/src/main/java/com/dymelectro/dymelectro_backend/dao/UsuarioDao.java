package com.dymelectro.dymelectro_backend.dao;

import com.dymelectro.dymelectro_backend.dto.usuario.UsuarioDTO;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Optional;

@Repository
public class UsuarioDao {

    private final JdbcProcedureSupport jdbc;

    public UsuarioDao(JdbcProcedureSupport jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<UsuarioAuthData> AUTH_MAPPER = (rs, i) -> new UsuarioAuthData(
            rs.getInt("id_usuario"),
            rs.getInt("id_rol"),
            rs.getString("nombre_rol"),
            rs.getString("nombres"),
            rs.getString("apellidos"),
            rs.getString("email"),
            rs.getString("password"),
            rs.getBoolean("estado"),
            rs.getInt("intentos_fallidos"),
            rs.getTimestamp("bloqueado_hasta") != null ? rs.getTimestamp("bloqueado_hasta").toLocalDateTime() : null
    );

    private static final RowMapper<UsuarioDTO> LISTADO_MAPPER = (rs, i) -> new UsuarioDTO(
            rs.getInt("id_usuario"),
            rs.getInt("id_rol"),
            rs.getString("nombre_rol"),
            rs.getString("nombres"),
            rs.getString("apellidos"),
            rs.getString("email"),
            rs.getBoolean("estado"),
            rs.getTimestamp("fecha_creacion") != null ? rs.getTimestamp("fecha_creacion").toLocalDateTime() : null
    );

    public Integer crearUsuario(Integer idRol, String nombres, String apellidos, String email, String passwordHash) {
        RowMapper<Integer> idMapper = (rs, i) -> rs.getInt("id_usuario");
        return jdbc.queryForOptional("{call sp_crear_usuario(?,?,?,?,?)}", idMapper,
                idRol, nombres, apellidos, email, passwordHash).orElseThrow();
    }

    public void editarUsuario(Integer idUsuario, Integer idRol, String nombres, String apellidos, String email) {
        jdbc.execute("{call sp_editar_usuario(?,?,?,?,?)}", idUsuario, idRol, nombres, apellidos, email);
    }

    public void cambiarEstadoUsuario(Integer idUsuario, boolean estado) {
        jdbc.execute("{call sp_cambiar_estado_usuario(?,?)}", idUsuario, estado ? 1 : 0);
    }

    public Optional<UsuarioAuthData> obtenerPorEmail(String email) {
        return jdbc.queryForOptional("{call sp_obtener_usuario_por_email(?)}", AUTH_MAPPER, email);
    }

    public void registrarFalloLogin(String email) {
        jdbc.execute("{call sp_registrar_fallo_login_usuario(?)}", email);
    }

    public void loginExitoso(String email) {
        jdbc.execute("{call sp_login_exitoso_usuario(?)}", email);
    }

    public static UsuarioDTO toDto(UsuarioAuthData a) {
        return new UsuarioDTO(a.idUsuario(), a.idRol(), a.nombreRol(), a.nombres(), a.apellidos(), a.email(), a.estado(), null);
    }

    public java.util.List<UsuarioDTO> listarUsuarios() {
        return jdbc.queryForList("{call sp_listar_usuarios()}", LISTADO_MAPPER);
    }
}
