package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.exception.ResourceNotFoundException;
import com.gsr.homeocare.model.Order;
import com.gsr.homeocare.model.OrderStatus;
import com.gsr.homeocare.repository.OrderRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MongoProperties mongoProperties;

    public OrderService(OrderRepository orderRepository, MongoProperties mongoProperties) {
        this.orderRepository = orderRepository;
        this.mongoProperties = mongoProperties;
    }

    public Order getOrderById(String id) {
        return orderRepository.findByIdAndOrganizationId(id, mongoProperties.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    public Order createOrder(Order order) {
        order.setOrganizationId(mongoProperties.getOrganizationId());
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.Ordered);
        }
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(String id, OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
