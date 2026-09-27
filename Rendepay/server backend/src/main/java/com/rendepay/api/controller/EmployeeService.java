package com.rendepay.api.service;

import com.rendepay.api.entity.Employee;
import com.rendepay.api.repository.EmployeeRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // المالك فقط هو من يستطيع إضافة موظفين أو مدراء جدد
    @PreAuthorize("hasRole('OWNER')")
    public Employee createEmployee(Employee employee) {
        if (employeeRepository.existsByEmployeeCode(employee.getEmployeeCode())) {
            throw new IllegalArgumentException("رمز الموظف مستخدم بالفعل");
        }

        // تشفير كلمة المرور قبل الحفظ
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        return employeeRepository.save(employee);
    }

    // المالك ومدير الفرع والمراجع يمكنهم استعراض قائمة الموظفين
    @PreAuthorize("hasAnyRole('OWNER', 'BRANCH_MANAGER', 'AUDITOR')")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
}