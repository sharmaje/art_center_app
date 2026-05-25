import { trpc } from "@/lib/trpc";
import { Patient } from "@/../../drizzle/schema";
import { useState } from "react";
import { toast } from "sonner";

interface PatientListProps {
  patients: Patient[];
  isLoading: boolean;
  onPatientDeleted: () => void;
}

export default function PatientList({ patients, isLoading, onPatientDeleted }: PatientListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const deletePatient = trpc.patients.delete.useMutation({
    onSuccess: () => {
      toast.success("Patient record deleted successfully");
      setDeleteConfirm(null);
      onPatientDeleted();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete patient record");
    },
  });

  const handleDelete = (id: number) => {
    deletePatient.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-2 border-[#1e90ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-2 text-gray-400 text-xs tracking-widest">LOADING RECORDS...</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-400 text-sm">No patient records found</p>
          <p className="text-gray-600 text-xs tracking-widest mt-2">Create a new record to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="blueprint-card p-4 hover:bg-[#0f1f2e] hover:[background-color:rgba(15,31,46,0.5)] transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Patient Name */}
              <h3 className="text-white font-bold text-lg truncate">
                {patient.patientName || "N/A"}
              </h3>

              {/* Registration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Registration Number</p>
                  <p className="text-[#64b5f6] font-mono">{patient.registrationNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">PLHIV Number</p>
                  <p className="text-[#64b5f6] font-mono">{patient.plhivNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Guardian</p>
                  <p className="text-gray-300">{patient.guardianName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Contact</p>
                  <p className="text-gray-300 font-mono">{patient.contactNumber || "N/A"}</p>
                </div>
              </div>

              {/* Address */}
              {patient.residentialAddress && (
                <div className="mt-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Address</p>
                  <p className="text-gray-300 text-sm">{patient.residentialAddress}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-3 text-xs text-gray-600 space-x-4">
                <span>Created: {new Date(patient.createdAt).toLocaleDateString()}</span>
                <span>ID: {patient.id}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {deleteConfirm === patient.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1 text-xs border border-gray-500 text-gray-400 hover:bg-gray-500 hover:[background-color:rgba(30,144,255,0.1)] transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    disabled={deletePatient.isPending}
                    className="px-3 py-1 text-xs border border-[#ef5350] text-[#ef5350] hover:bg-[#ef5350] hover:[background-color:rgba(30,144,255,0.1)] transition-colors disabled:opacity-50"
                  >
                    {deletePatient.isPending ? "..." : "CONFIRM"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(patient.id)}
                  className="px-3 py-1 text-xs border border-[#ef5350] [border-color:rgba(30,144,255,0.4)] text-[#ef5350] hover:bg-[#ef5350] hover:[background-color:rgba(30,144,255,0.1)] transition-colors"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
