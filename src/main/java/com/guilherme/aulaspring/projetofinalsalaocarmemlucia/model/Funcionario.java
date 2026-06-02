package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.CategoriaFuncionario;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name="funcionario")
@Data
//UserDatails é uma interface que funciona como um "porteiro" a função dele e atuar como um contrato de dados entre a classe e o sistera de seguraça,
// ele carrega a senha, autoridade e status
public class Funcionario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    @Column(name="nome", length = 100, nullable = false)
    private String nome;
    @Column(name="email", length = 50, nullable = true)
    private String email;
    @Column(name="senha", length = 255, nullable = false)
    private String senha;
    @Column(name="ativo")
    private Boolean ativo = true;
    @Column(name="papel", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private CategoriaFuncionario papel;
    @Column(name = "reset_token")
    private String resetToken;
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    public Funcionario() {
    }

    public Funcionario(Long id, String nome, String email, String senha, Boolean ativo, CategoriaFuncionario papel, String resetToken, LocalDateTime resetTokenExpiry) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.ativo = ativo;
        this.papel = papel;
        this.resetToken = resetToken;
        this.resetTokenExpiry = resetTokenExpiry;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.papel == CategoriaFuncionario.ADMIN) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override public boolean isAccountNonExpired() {
        return true; }

    @Override public boolean isAccountNonLocked() {
        return true; }

    @Override public boolean isCredentialsNonExpired() {
        return true; }

    @Override public boolean isEnabled() {
        return this.ativo; }
}

