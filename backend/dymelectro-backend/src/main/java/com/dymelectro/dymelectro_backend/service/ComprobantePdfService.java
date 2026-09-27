package com.dymelectro.dymelectro_backend.service;

import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteCabeceraDTO;
import com.dymelectro.dymelectro_backend.dto.venta.ComprobanteResponse;
import com.dymelectro.dymelectro_backend.dto.venta.DetalleVentaDTO;
import com.dymelectro.dymelectro_backend.exception.BusinessException;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Arma el PDF del comprobante de venta. No toca la BD ni valida permisos --
 * eso ya lo hizo VentaService antes de llamar aqui. Solo dibuja.
 *
 * Datos de la empresa: mantener sincronizados con src/utils/empresa.js del
 * frontend si alguna vez cambian.
 */
@Service
public class ComprobantePdfService {

    private static final String RAZON_SOCIAL = "D&M Electro Soluciones y Proyectos S.A.C.";
    private static final String RUC = "20603140037";
    private static final String DIRECCION = "Calle Constantino Bayle #3420, Urb. Condevilla - SMP, Lima";

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Color COLOR_MARCA = new Color(30, 58, 96);

    private static final Font FUENTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, COLOR_MARCA);
    private static final Font FUENTE_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
    private static final Font FUENTE_ETIQUETA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.GRAY);
    private static final Font FUENTE_VALOR = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
    private static final Font FUENTE_TABLA_ENCABEZADO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private static final Font FUENTE_TABLA_CELDA = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
    private static final Font FUENTE_TOTAL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COLOR_MARCA);
    private static final Font FUENTE_PIE = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, Color.GRAY);

    public byte[] generar(ComprobanteResponse comprobante) {
        ComprobanteCabeceraDTO c = comprobante.cabecera();
        Document documento = new Document(PageSize.A4, 42, 42, 50, 42);
        ByteArrayOutputStream salida = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(documento, salida);
            documento.open();

            documento.add(new Paragraph(RAZON_SOCIAL, FUENTE_TITULO));
            documento.add(new Paragraph("RUC " + RUC + "  -  " + DIRECCION, FUENTE_SUBTITULO));
            documento.add(new Paragraph(" "));

            documento.add(construirCajaTipoComprobante(c));
            documento.add(new Paragraph(" "));

            agregarDato(documento, "Cliente", c.nombresCliente() + " " + c.apellidosCliente());
            agregarDato(documento, c.tipoDocumento(), c.numeroDocumento());
            if ("Factura".equals(c.tipoComprobante())) {
                agregarDato(documento, "RUC", c.rucFacturacion());
                agregarDato(documento, "Razon social", c.razonSocialFacturacion());
            }
            agregarDato(documento, "Fecha de emision", c.fechaVenta().format(FORMATO_FECHA));
            agregarDato(documento, "Estado", c.estadoVenta());
            documento.add(new Paragraph(" "));

            documento.add(construirTablaDetalle(comprobante.detalle()));
            documento.add(new Paragraph(" "));

            documento.add(construirTablaTotales(c));

            if (c.tarjetaMarca() != null) {
                documento.add(new Paragraph(" "));
                String textoPago = "Pagado con tarjeta " + c.tarjetaMarca()
                        + (c.tarjetaUltimos4() != null ? " terminada en " + c.tarjetaUltimos4() : "");
                documento.add(new Paragraph(textoPago, FUENTE_SUBTITULO));
            }

            documento.add(new Paragraph(" "));
            documento.add(new Paragraph(" "));
            Paragraph pie = new Paragraph(
                    "Documento generado por el sistema interno de D&M Electro con fines de gestion y control. "
                            + "No constituye un comprobante de pago electronico emitido ante SUNAT.",
                    FUENTE_PIE);
            pie.setAlignment(Element.ALIGN_CENTER);
            documento.add(pie);

            documento.close();
        } catch (DocumentException e) {
            throw new BusinessException("No se pudo generar el PDF del comprobante: " + e.getMessage());
        }

        return salida.toByteArray();
    }

    private PdfPTable construirCajaTipoComprobante(ComprobanteCabeceraDTO c) {
        String tipo = c.tipoComprobante().toUpperCase(Locale.ROOT) + " ELECTRONICA";
        String numero = c.serieComprobante() + "-" + String.format("%06d", c.numeroComprobante());

        Paragraph texto = new Paragraph(tipo + "   " + numero,
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE));
        texto.setAlignment(Element.ALIGN_CENTER);

        PdfPTable caja = new PdfPTable(1);
        caja.setWidthPercentage(100);
        PdfPCell celda = new PdfPCell(texto);
        celda.setBackgroundColor(COLOR_MARCA);
        celda.setPadding(8);
        caja.addCell(celda);
        return caja;
    }

    private void agregarDato(Document documento, String etiqueta, String valor) throws DocumentException {
        Paragraph p = new Paragraph();
        p.add(new Chunk(etiqueta.toUpperCase(Locale.ROOT) + ":  ", FUENTE_ETIQUETA));
        p.add(new Chunk(valor, FUENTE_VALOR));
        p.setSpacingAfter(3);
        documento.add(p);
    }

    private PdfPTable construirTablaDetalle(List<DetalleVentaDTO> detalle) {
        PdfPTable tabla = new PdfPTable(4);
        tabla.setWidthPercentage(100);
        try {
            tabla.setWidths(new float[] { 46, 14, 20, 20 });
        } catch (DocumentException ignored) {
            // no ocurre: el arreglo tiene el mismo tamaño que las columnas de la tabla
        }

        agregarCeldaEncabezado(tabla, "PRODUCTO");
        agregarCeldaEncabezado(tabla, "CANT.");
        agregarCeldaEncabezado(tabla, "P. UNITARIO");
        agregarCeldaEncabezado(tabla, "SUBTOTAL");

        for (DetalleVentaDTO d : detalle) {
            agregarCeldaCuerpo(tabla, d.nombre(), Element.ALIGN_LEFT);
            agregarCeldaCuerpo(tabla, String.valueOf(d.cantidad()), Element.ALIGN_CENTER);
            agregarCeldaCuerpo(tabla, formatearMonto(d.precioVenta()), Element.ALIGN_RIGHT);
            agregarCeldaCuerpo(tabla, formatearMonto(d.subtotal()), Element.ALIGN_RIGHT);
        }

        return tabla;
    }

    private void agregarCeldaEncabezado(PdfPTable tabla, String texto) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, FUENTE_TABLA_ENCABEZADO));
        celda.setBackgroundColor(COLOR_MARCA);
        celda.setPadding(6);
        celda.setHorizontalAlignment(Element.ALIGN_CENTER);
        tabla.addCell(celda);
    }

    private void agregarCeldaCuerpo(PdfPTable tabla, String texto, int alineacion) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, FUENTE_TABLA_CELDA));
        celda.setPadding(5);
        celda.setHorizontalAlignment(alineacion);
        tabla.addCell(celda);
    }

    private PdfPTable construirTablaTotales(ComprobanteCabeceraDTO c) {
        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(45);
        tabla.setHorizontalAlignment(Element.ALIGN_RIGHT);
        try {
            tabla.setWidths(new float[] { 55, 45 });
        } catch (DocumentException ignored) {
        }

        agregarFilaTotal(tabla, "Op. gravada", formatearMonto(c.subtotal()), FUENTE_VALOR);
        if (c.igv().compareTo(BigDecimal.ZERO) > 0) {
            agregarFilaTotal(tabla, "IGV (18%)", formatearMonto(c.igv()), FUENTE_VALOR);
        }
        agregarFilaTotal(tabla, "TOTAL", formatearMonto(c.total()), FUENTE_TOTAL);

        return tabla;
    }

    private void agregarFilaTotal(PdfPTable tabla, String etiqueta, String valor, Font fuenteValor) {
        PdfPCell celdaEtiqueta = new PdfPCell(new Phrase(etiqueta, FUENTE_ETIQUETA));
        celdaEtiqueta.setBorder(Rectangle.TOP);
        celdaEtiqueta.setPadding(4);
        tabla.addCell(celdaEtiqueta);

        PdfPCell celdaValor = new PdfPCell(new Phrase(valor, fuenteValor));
        celdaValor.setBorder(Rectangle.TOP);
        celdaValor.setHorizontalAlignment(Element.ALIGN_RIGHT);
        celdaValor.setPadding(4);
        tabla.addCell(celdaValor);
    }

    private String formatearMonto(BigDecimal monto) {
        return "S/ " + String.format(Locale.US, "%,.2f", monto);
    }
}