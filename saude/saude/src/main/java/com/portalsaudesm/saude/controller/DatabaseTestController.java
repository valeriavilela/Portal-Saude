package com.portalsaudesm.saude.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class DatabaseTestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/api/test/database")
    public Map<String, Object> testDatabaseConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Testa a conexão com um simples SELECT
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            
            if (result == 1) {
                response.put("status", "SUCCESS");
                response.put("message", "Conexão com banco de dados estabelecida com sucesso!");
                response.put("database", "agendamento_saude");
                response.put("timestamp", System.currentTimeMillis());
                return response;
            }
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Erro ao conectar com o banco de dados: " + e.getMessage());
            response.put("error", e.getClass().getName());
            response.put("timestamp", System.currentTimeMillis());
            return response;
        }
        
        response.put("status", "UNKNOWN");
        response.put("message", "Status desconhecido");
        return response;
    }

    @GetMapping("/api/test/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", "Saude - Sistema de Agendamento");
        return response;
    }
}
