package com.gsr.homeocare.dto;

public class PatientSummary {

    private String phone;
    private String name;
    private String email;
    private int consultationCount;
    private int orderCount;
    private int prescriptionCount;

    public PatientSummary() {
    }

    public PatientSummary(String phone, String name, String email, int consultationCount, int orderCount, int prescriptionCount) {
        this.phone = phone;
        this.name = name;
        this.email = email;
        this.consultationCount = consultationCount;
        this.orderCount = orderCount;
        this.prescriptionCount = prescriptionCount;
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

    public int getConsultationCount() {
        return consultationCount;
    }

    public void setConsultationCount(int consultationCount) {
        this.consultationCount = consultationCount;
    }

    public int getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(int orderCount) {
        this.orderCount = orderCount;
    }

    public int getPrescriptionCount() {
        return prescriptionCount;
    }

    public void setPrescriptionCount(int prescriptionCount) {
        this.prescriptionCount = prescriptionCount;
    }
}
