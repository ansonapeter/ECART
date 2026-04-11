package com.example.Ecommerce.exception;

import com.example.Ecommerce.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class GlobalExceptionHandler {

    // ✅ Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex
    ) {

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        ErrorResponse error = ErrorResponse.builder()
                .error("Validation Error")
                .message(message)
                .status(400)
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }


    // ✅ Handle runtime exceptions
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex
    ) {

        ErrorResponse error = ErrorResponse.builder()
                .error("Business Error")
                .message(ex.getMessage())
                .status(400)
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }


    // ✅ Handle all other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex
    ) {

        ErrorResponse error = ErrorResponse.builder()
                .error("Server Error")
                .message("Something went wrong")
                .status(500)
                .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
