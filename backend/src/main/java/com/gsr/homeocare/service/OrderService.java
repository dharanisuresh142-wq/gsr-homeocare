package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.dto.OrderCreateRequest;
import com.gsr.homeocare.exception.ResourceNotFoundException;
import com.gsr.homeocare.model.Order;
import com.gsr.homeocare.model.OrderItem;
import com.gsr.homeocare.model.OrderStatus;
import com.gsr.homeocare.model.PaymentMethod;
import com.gsr.homeocare.model.PaymentStatus;
import com.gsr.homeocare.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MongoProperties mongoProperties;

    public OrderService(OrderRepository orderRepository, MongoProperties mongoProperties) {
        this.orderRepository = orderRepository;
        this.mongoProperties = mongoProperties;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findByOrganizationIdOrderByCreatedAtDesc(mongoProperties.getOrganizationId());
    }

    public List<Order> getOrdersByPhone(String phone) {
        return orderRepository.findByPhoneAndOrganizationIdOrderByCreatedAtDesc(
                phone.trim(), mongoProperties.getOrganizationId());
    }

    public Order getOrderById(String id) {
        return orderRepository.findByIdAndOrganizationId(id, mongoProperties.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    public Order createOrder(OrderCreateRequest request) {
        Order order = new Order();
        order.setOrganizationId(mongoProperties.getOrganizationId());
        order.setCustomerName(request.getCustomerName().trim());
        order.setPhone(request.getPhone().trim());
        order.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        order.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        order.setItems(request.getItems());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.Ordered);

        double total = 0;
        for (OrderItem item : request.getItems()) {
            total += item.getPrice() * item.getQuantity();
        }
        order.setTotalAmount(total);

        if (request.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.Pending);
        } else {
            order.setPaymentStatus(PaymentStatus.Paid);
        }

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(String id, OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
