package com.dymelectro.dymelectro_backend.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JdbcProcedureSupport {

    private final JdbcTemplate jdbcTemplate;

    public JdbcProcedureSupport(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** Llama un procedimiento que devuelve un unico result set (0..N filas). */
    public <T> List<T> queryForList(String callSql, RowMapper<T> mapper, Object... params) {
        return jdbcTemplate.query(con -> {
            CallableStatement cs = con.prepareCall(callSql);
            bindParams(cs, params);
            return cs;
        }, mapper);
    }

    /** Llama un procedimiento que devuelve un unico result set con a lo sumo una fila. */
    public <T> Optional<T> queryForOptional(String callSql, RowMapper<T> mapper, Object... params) {
        List<T> result = queryForList(callSql, mapper, params);
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    /** Llama un procedimiento sin result set (solo INSERT/UPDATE/DELETE). */
    public void execute(String callSql, Object... params) {
        jdbcTemplate.update(con -> {
            CallableStatement cs = con.prepareCall(callSql);
            bindParams(cs, params);
            return cs;
        });
    }

    /**
     * Llama un procedimiento que devuelve dos result sets (ej. cabecera + detalle),
     * como sp_obtener_producto_detalle, sp_obtener_comprobante o sp_obtener_detalle_compra.
     */
    public <A, B> TwoResultSets<A, B> queryTwoResultSets(String callSql, RowMapper<A> mapperA, RowMapper<B> mapperB, Object... params) {
        return jdbcTemplate.execute((org.springframework.jdbc.core.ConnectionCallback<TwoResultSets<A, B>>) con -> {
            try (CallableStatement cs = con.prepareCall(callSql)) {
                bindParams(cs, params);
                boolean hasResults = cs.execute();
                List<A> first = new ArrayList<>();
                List<B> second = new ArrayList<>();
                int resultSetIndex = 0;
                while (true) {
                    if (hasResults) {
                        try (ResultSet rs = cs.getResultSet()) {
                            int rowNum = 0;
                            while (rs.next()) {
                                if (resultSetIndex == 0) {
                                    first.add(mapperA.mapRow(rs, rowNum++));
                                } else if (resultSetIndex == 1) {
                                    second.add(mapperB.mapRow(rs, rowNum++));
                                }
                            }
                        }
                        resultSetIndex++;
                    } else if (cs.getUpdateCount() == -1) {
                        break;
                    }
                    hasResults = cs.getMoreResults();
                }
                return new TwoResultSets<>(first, second);
            }
        });
    }

    private void bindParams(CallableStatement cs, Object... params) throws SQLException {
        for (int i = 0; i < params.length; i++) {
            cs.setObject(i + 1, params[i]);
        }
    }

    public record TwoResultSets<A, B>(List<A> first, List<B> second) {}
}
