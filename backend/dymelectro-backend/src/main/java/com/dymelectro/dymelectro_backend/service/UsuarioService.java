package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.UsuarioDao;
import com.dymelectro.dymelectro_backend.dto.usuario.CrearUsuarioRequest;
import com.dymelectro.dymelectro_backend.dto.usuario.EditarUsuarioRequest;
import com.dymelectro.dymelectro_backend.dto.usuario.UsuarioDTO;
import com.dymelectro.dymelectro_backend.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioDao usuarioDao;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioDao usuarioDao, PasswordEncoder passwordEncoder) {
        this.usuarioDao = usuarioDao;
        this.passwordEncoder = passwordEncoder;
    }

    public Integer crear(CrearUsuarioRequest req) {
        String hash = passwordEncoder.encode(req.password());
        return usuarioDao.crearUsuario(req.idRol(), req.nombres(), req.apellidos(), req.email(), hash);
    }

    public void editar(Integer idUsuario, EditarUsuarioRequest req) {
        usuarioDao.editarUsuario(idUsuario, req.idRol(), req.nombres(), req.apellidos(), req.email());
    }

    public void cambiarEstado(Integer idUsuario, boolean estado) {
        usuarioDao.cambiarEstadoUsuario(idUsuario, estado);
    }

    public UsuarioDTO obtenerPorEmail(String email) {
        return usuarioDao.obtenerPorEmail(email)
                .map(UsuarioDao::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public java.util.List<UsuarioDTO> listarTodos() {
        return usuarioDao.listarUsuarios();
    }
}
