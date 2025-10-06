package com.railway.concessionsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Disable CSRF and enable CORS using lambda DSL
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable()) // Or configure properly if you need CORS
            
            // Configure authorization using lambda DSL
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Allow ALL requests without authentication
            )
            
            // Disable form login and basic auth
            .formLogin(form -> form.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            
            .build();
    }
    
    // Optional: Keep PasswordEncoder if you need it later
    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}