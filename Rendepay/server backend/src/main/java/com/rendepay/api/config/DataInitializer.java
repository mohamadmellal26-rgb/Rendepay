package com.rendepay.api.config;

import com.rendepay.api.entity.Employee;
import com.rendepay.api.entity.Role;
import com.rendepay.api.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminCode = "ADM-101";

            // التحقق مما إذا كان حساب المالك موجوداً مسبقاً لمنع التكرار
            if (!employeeRepository.existsByEmployeeCode(adminCode)) {
                Employee admin = new Employee();
                
                admin.setEmployeeCode(adminCode);
                admin.setName("محمد - المالك الرئيسي");
                admin.setEmail("admin@rendepay.com");
                
                // تشفير كلمة المرور قبل الحفظ في قاعدة البيانات
                admin.setPassword(passwordEncoder.encode("admin123"));
                
                // تعيين الصلاحية الصحيحة المطابقة لملف Role.java
                admin.setRole(Role.ROLE_OWNER); 
                
                admin.setBranchCode("001");

                employeeRepository.save(admin);
                
                System.out.println("==================================================");
                System.out.println(">>> تم إنشاء حساب المالك بنجاح في قاعدة البيانات!");
                System.out.println(">>> معرّف الموظف: " + adminCode);
                System.out.println(">>> كلمة المرور: admin123");
                System.out.println("==================================================");
            }
        };
    }
}