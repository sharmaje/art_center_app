import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

interface PatientFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PatientForm({ onClose, onSuccess }: PatientFormProps) {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    plhivNumber: "",
    patientName: "",
    guardianName: "",
    contactNumber: "",
    residentialAddress: "",
  });

  const createPatient = trpc.patients.create.useMutation({
    onSuccess: () => {
      toast.success("Patient record created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create patient record");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPatient.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#1e90ff] [border-color:rgba(30,144,255,0.2)] pb-6">
        <h2 className="blueprint-section-title text-lg">NEW PATIENT REGISTRATION</h2>
        <p className="text-gray-400 text-xs tracking-widest">All fields are optional</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Registration Number */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            Registration Number
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="e.g., REG-001"
            className="blueprint-input"
          />
        </div>

        {/* PLHIV Number */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            PLHIV Number
          </label>
          <input
            type="text"
            name="plhivNumber"
            value={formData.plhivNumber}
            onChange={handleChange}
            placeholder="e.g., PLHIV-12345"
            className="blueprint-input"
          />
        </div>

        {/* Patient Name */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            Patient Name
          </label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Full name of patient"
            className="blueprint-input"
          />
        </div>

        {/* Guardian Name */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            Guardian Name
          </label>
          <input
            type="text"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleChange}
            placeholder="Father/Guardian name"
            className="blueprint-input"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            Contact Number
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Phone number"
            className="blueprint-input"
          />
        </div>

        {/* Residential Address */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            Residential Address
          </label>
          <textarea
            name="residentialAddress"
            value={formData.residentialAddress}
            onChange={handleChange}
            placeholder="Full residential address"
            rows={3}
            className="blueprint-input resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-[#1e90ff] [border-color:rgba(30,144,255,0.2)]">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-[#1e90ff] [border-color:rgba(30,144,255,0.4)] text-white hover:bg-[#1e90ff] hover:[background-color:rgba(30,144,255,0.1)] transition-colors text-sm font-bold uppercase tracking-wider"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={createPatient.isPending}
          className="flex-1 blueprint-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createPatient.isPending ? "SAVING..." : "SAVE RECORD"}
        </button>
      </div>
    </form>
  );
}
