package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.LancamentoFinanceiro;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service.LancamentoFinanceiroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/financeiro")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LancamentoFinanceiroController {

    private final LancamentoFinanceiroService service;

    // LISTAR O EXTRATO COMPLETO
    @GetMapping
    public ResponseEntity<List<LancamentoFinanceiro>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @PostMapping("/manual")
    public ResponseEntity<?> salvarManual(@RequestBody LancamentoFinanceiro lancamento) {
        try {
            lancamento.setData(java.time.LocalDateTime.now());
            LancamentoFinanceiro salvo = service.salvar(lancamento);
            return ResponseEntity.ok(salvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LancamentoFinanceiro> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}