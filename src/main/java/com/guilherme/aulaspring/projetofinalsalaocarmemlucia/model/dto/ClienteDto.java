package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Cliente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ClienteDto(
        @NotBlank(message = "O nome do cliente é obrigatório")
        String nome,
        @NotBlank(message = "O telefone/WhatsApp é obrigatório")
        String telefone,
        @NotNull(message = "A data de nascimento é obrigatória")
        LocalDate dataNascimento,
        String cpf,
        String observacoes
) {

    public Cliente mapearParaCliente() {
        Cliente cliente = new Cliente();
        cliente.setNome(this.nome);
        cliente.setTelefone(this.telefone);
        cliente.setDataNascimento(this.dataNascimento);
        cliente.setCpf(this.cpf);
        cliente.setObservacoes(this.observacoes);
        cliente.setAtivo(true);
        return cliente;
    }
}