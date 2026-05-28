package com.guilherme.aulaspring.projetofinalsalaocarmemlucia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProjetoFinalSalaoCarmemLuciaApplication {

    public static void main(String[] args) {
        System.setProperty("java.net.preferIPv4Stack", "true");
        SpringApplication.run(ProjetoFinalSalaoCarmemLuciaApplication.class, args);
    }

}
