import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Pending() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen blueprint-grid flex items-center justify-center p-4">
      {/* Grid overlay animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 scan-line"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Corner brackets */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#1e90ff] [border-color:rgba(30,144,255,0.6)]"></div>
        <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[#1e90ff] [border-color:rgba(30,144,255,0.6)]"></div>
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[#1e90ff] [border-color:rgba(30,144,255,0.6)]"></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#1e90ff] [border-color:rgba(30,144,255,0.6)]"></div>

        {/* Main card */}
        <div className="blueprint-card p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-2 border-[#ffb74d] [border-color:rgba(30,144,255,0.6)] flex items-center justify-center">
                <div className="text-2xl">⏳</div>
              </div>
            </div>
            <h1 className="blueprint-section-title text-2xl text-[#ffb74d]">ACCESS PENDING</h1>
            <div className="blueprint-divider"></div>
          </div>

          {/* Content */}
          <div className="space-y-4 text-center">
            <p className="text-gray-300 text-sm leading-relaxed">
              Your access request to the HIV Paeds CHK system has been received and is awaiting administrative approval.
            </p>
            <div className="bg-[#0a1628] border border-[#ffb74d] [border-color:rgba(var(--border),0.3)] rounded-sm p-4">
              <p className="text-[#ffb74d] text-xs tracking-widest font-bold mb-2">[ AUTHORIZATION PENDING ]</p>
              <p className="text-gray-400 text-sm">
                An administrator will review your request and send you an email notification once a decision has been made.
              </p>
            </div>
            <p className="text-gray-500 text-xs tracking-widest">
              Typical review time: 24-48 hours
            </p>
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="blueprint-btn w-full"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
