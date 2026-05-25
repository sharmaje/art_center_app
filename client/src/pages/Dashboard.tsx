import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import PatientForm from "@/components/PatientForm";
import PatientList from "@/components/PatientList";
import AccessStatus from "@/components/AccessStatus";
import GoogleSheetsSync from "@/components/GoogleSheetsSync";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get access status
  const { data: accessStatus, isLoading: statusLoading } = trpc.access.getStatus.useQuery();

  // Get patient list
  const { data: patients = [], isLoading: patientsLoading, refetch: refetchPatients } = trpc.patients.list.useQuery(
    undefined,
    {
      enabled: accessStatus?.status === "approved",
      onError: (error) => {
        console.error("Failed to load patients:", error);
      },
    }
  );

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Filter patients based on search
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      (patient.patientName?.toLowerCase().includes(query) || false) ||
      (patient.registrationNumber?.toLowerCase().includes(query) || false) ||
      (patient.plhivNumber?.toLowerCase().includes(query) || false)
    );
  });

  if (statusLoading) {
    return (
      <div className="min-h-screen blueprint-grid flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-2 border-[#1e90ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-white text-sm tracking-widest">LOADING SYSTEM...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have approved access, show access status page
  if (accessStatus?.status !== "approved") {
    return <AccessStatus status={accessStatus?.status || "pending"} />;
  }

  return (
    <div className="min-h-screen blueprint-grid">
      {/* Grid overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 scan-line"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="blueprint-header sticky top-0 z-50 border-b border-[#1e90ff] [border-color:rgba(var(--border),0.3)]">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border-2 border-[#1e90ff] [border-color:rgba(30,144,255,0.6)] flex items-center justify-center">
                <span className="text-lg font-bold text-[#1e90ff]">⚕</span>
              </div>
              <div>
                <h1 className="blueprint-section-title text-xl">HIV PAEDS CHK</h1>
                <p className="text-[#64b5f6] text-xs tracking-wider">PATIENT RECORDS SYSTEM</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-sm font-mono">{user?.email}</p>
                <p className="text-gray-400 text-xs tracking-widest">APPROVED ACCESS</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[#1e90ff] [border-color:rgba(30,144,255,0.4)] text-white hover:bg-[#1e90ff] hover:[background-color:rgba(30,144,255,0.1)] transition-colors text-sm font-bold uppercase tracking-wider"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Search and Actions */}
          <div className="space-y-4">
            <div className="flex gap-4 items-end flex-col md:flex-row">
              <div className="flex-1 w-full">
                <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                  SEARCH PATIENTS
                </label>
                <input
                  type="text"
                  placeholder="Search by name, registration number, or PLHIV number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="blueprint-input"
                />
              </div>
              <div className="flex gap-2 whitespace-nowrap">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="blueprint-btn"
                >
                  + REGISTER NEW
                </button>
                {patients.length > 0 && (
                  <button
                    onClick={() => setIsSyncOpen(true)}
                    className="px-4 py-2 border border-[#1e90ff] [border-color:rgba(30,144,255,0.4)] text-white hover:bg-[#1e90ff] hover:[background-color:rgba(30,144,255,0.1)] transition-colors text-sm font-bold uppercase tracking-wider"
                  >
                    ⬆ SYNC
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Patient Records */}
          <div className="blueprint-card p-6">
            <h2 className="blueprint-section-title text-lg mb-6">PATIENT RECORDS DATABASE</h2>
            <PatientList
              patients={filteredPatients}
              isLoading={patientsLoading}
              onPatientDeleted={() => refetchPatients()}
            />
          </div>
        </main>
      </div>

      {/* Patient Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black [background-color:rgba(0,0,0,0.75)] flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1f2e] border border-[#1e90ff] [border-color:rgba(30,144,255,0.4)] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PatientForm
              onClose={() => setIsFormOpen(false)}
              onSuccess={() => {
                setIsFormOpen(false);
                refetchPatients();
              }}
            />
          </div>
        </div>
      )}

      {/* Google Sheets Sync Modal */}
      {isSyncOpen && (
        <div className="fixed inset-0 bg-black [background-color:rgba(0,0,0,0.75)] flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1f2e] border border-[#1e90ff] [border-color:rgba(30,144,255,0.4)] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GoogleSheetsSync
              patientCount={patients.length}
              onClose={() => setIsSyncOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
