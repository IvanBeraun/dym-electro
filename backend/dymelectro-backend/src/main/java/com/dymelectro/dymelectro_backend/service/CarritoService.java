package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dao.CarritoDao;
import com.dymelectro.dymelectro_backend.dto.carrito.CarritoItemDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarritoService {

    private final CarritoDao carritoDao;

    public CarritoService(CarritoDao carritoDao) {
        this.carritoDao = carritoDao;
    }

    public List<CarritoItemDTO> agregar(Integer idCliente, Integer idProducto, Integer cantidad) {
        carritoDao.agregar(idCliente, idProducto, cantidad);
        return carritoDao.obtenerCarrito(idCliente);
    }

    public List<CarritoItemDTO> actualizarCantidad(Integer idCliente, Integer idProducto, Integer cantidad) {
        carritoDao.actualizarCantidad(idCliente, idProducto, cantidad);
        return carritoDao.obtenerCarrito(idCliente);
    }

    public List<CarritoItemDTO> eliminarProducto(Integer idCliente, Integer idProducto) {
        carritoDao.eliminarProducto(idCliente, idProducto);
        return carritoDao.obtenerCarrito(idCliente);
    }

    public void vaciar(Integer idCliente) {
        carritoDao.vaciar(idCliente);
    }

    public List<CarritoItemDTO> obtener(Integer idCliente) {
        return carritoDao.obtenerCarrito(idCliente);
    }
}
