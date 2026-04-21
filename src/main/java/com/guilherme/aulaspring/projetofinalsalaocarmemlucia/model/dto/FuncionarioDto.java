package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.CategoriaFuncionario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

//Essa camada chamada DTO, serve para transportar informações entre o Front e o back end, deixando o código mais seguro e mostrando apenas o necessário

//A classe Record é uma formasimplificada para criar classes, geralmente usamos elas para carregar dados
public record FuncionarioDto(
        @NotBlank String nome,
        @Email String email,
        @NotBlank @Size(min = 6, max = 6) String senha,
        @NotNull CategoriaFuncionario papel
) {
    //Esse metodo serve para passar dados paa a camada de dominio
    public Funcionario mapearParaFuncionario() {
        Funcionario f = new Funcionario();
        f.setNome(this.nome);
        f.setEmail(this.email);
        f.setSenha(this.senha);
        f.setPapel(this.papel);
        return f;
    }
}

