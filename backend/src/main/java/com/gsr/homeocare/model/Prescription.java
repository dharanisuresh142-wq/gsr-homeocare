package com.gsr.homeocare.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "prescriptions")
public class Prescription extends BaseDocument {

    private String patientPhone;
    private String patientName;
    private String doctorName;
    private String consultationId;
    private List<PrescriptionLine> medicines = new ArrayList<>();
    private String notes;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Prescription() {
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getConsultationId() {
        return consultationId;
    }

    public void setConsultationId(String consultationId) {
        this.consultationId = consultationId;
    }

    public List<PrescriptionLine> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionLine> medicines) {
        this.medicines = medicines != null ? medicines : new ArrayList<>();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
