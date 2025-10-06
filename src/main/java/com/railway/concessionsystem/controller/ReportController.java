package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    // Generate CSV report for applications
    @GetMapping("/applications/csv")
    public ResponseEntity<String> generateApplicationsCSV() {
        List<Application> applications = applicationRepository.findAll();
        
        StringWriter csvWriter = new StringWriter();
        csvWriter.append("Application ID,Student ID,Student Name,Route From,Route To,Status,Certificate No,Application Date\n");
        
        for (Application app : applications) {
            csvWriter.append(String.valueOf(app.getAppId())).append(",");
            csvWriter.append(app.getStudent().getId()).append(",");
            csvWriter.append(escapeCsv(app.getStudentName())).append(",");
            csvWriter.append(escapeCsv(app.getRouteFrom())).append(",");
            csvWriter.append(escapeCsv(app.getRouteTo())).append(",");
            csvWriter.append(app.getStatus().toString()).append(",");
            csvWriter.append(app.getCurrentCertificateNo() != null ? app.getCurrentCertificateNo() : "").append(",");
            csvWriter.append(app.getApplicationDate().toString()).append("\n");
        }
        
        return ResponseEntity.ok()
            .header("Content-Type", "text/csv")
            .header("Content-Disposition", "attachment; filename=applications.csv")
            .body(csvWriter.toString());
    }
    
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}