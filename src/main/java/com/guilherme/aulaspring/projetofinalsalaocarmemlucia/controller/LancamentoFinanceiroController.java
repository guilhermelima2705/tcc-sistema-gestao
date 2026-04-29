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

    @GetMapping
    public ResponseEntity<List<LancamentoFinanceiro>> listarTodos() {

        return ResponseEntity.ok(service.listarTodos());
    }

    @PostMapping("/manual")
    public ResponseEntity<?> salvarManual(@RequestBody LancamentoFinanceiro lancamento) {
        try {
            if (lancamento.getData() == null) {
                lancamento.setData(java.time.LocalDateTime.now());
            }
            System.out.println("Valor recebido: " + lancamento.getValor());

            LancamentoFinanceiro salvo = service.salvar(lancamento);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar: " + e.getMessage());
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