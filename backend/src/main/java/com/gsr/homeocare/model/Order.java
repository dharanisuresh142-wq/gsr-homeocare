package com.gsr.homeocare.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "orders")
public class Order extends BaseDocument {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Order status is required")
    private OrderStatus status = OrderStatus.Ordered;

    public Order() {
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
