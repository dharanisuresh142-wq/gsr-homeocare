package com.gsr.homeocare.dto;

import com.gsr.homeocare.model.Consultation;
import com.gsr.homeocare.model.Feedback;
import com.gsr.homeocare.model.FollowUp;
import com.gsr.homeocare.model.Order;
import com.gsr.homeocare.model.Prescription;

import java.util.List;

public class PatientDetail {

    private String phone;
    private String name;
    private String email;
    private List<Consultation> consultations;
    private List<Order> orders;
    private List<Prescription> prescriptions;
    private List<FollowUp> followUps;
    private List<Feedback> feedback;

    public PatientDetail() {
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<Consultation> getConsultations() {
        return consultations;
    }

    public void setConsultations(List<Consultation> consultations) {
        this.consultations = consultations;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public List<Prescription> getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(List<Prescription> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public List<FollowUp> getFollowUps() {
        return followUps;
    }

    public void setFollowUps(List<FollowUp> followUps) {
        this.followUps = followUps;
    }

    public List<Feedback> getFeedback() {
        return feedback;
    }

    public void setFeedback(List<Feedback> feedback) {
        this.feedback = feedback;
    }
}
