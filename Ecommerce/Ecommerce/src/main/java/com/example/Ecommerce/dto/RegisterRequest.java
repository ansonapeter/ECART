package com.example.Ecommerce.dto;

import com.example.Ecommerce.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String password;


    private Role role;
}
