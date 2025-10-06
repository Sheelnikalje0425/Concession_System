package com.railway.concessionsystem.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping
    public String test() {
        return "API is working! ✅ " + new java.util.Date();
    }
    
    @GetMapping("/students")
    public String testStudents() {
        return "Students endpoint would work!";
    }
}