import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

interface GoogleSheetsSyncProps {
  patientCount: number;
  onClose: () => void;
}

export default function GoogleSheetsSync({ patientCount, onClose }: GoogleSheetsSyncProps) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Patients");

  const syncMutation = trpc.sync.toGoogleSheets.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Sync completed successfully");
      setSpreadsheetId("");
      setSheetName("Patients");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync to Google Sheets");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!spreadsheetId.trim()) {
      toast.error("Please enter a valid spreadsheet ID");
      return;
    }

    syncMutation.mutate({
      spreadsheetId: spreadsheetId.trim(),
      sheetName: sheetName || "Patients",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#1e90ff] [border-color:rgba(30,144,255,0.2)] pb-6">
        <h2 className="blueprint-section-title text-lg">SYNC TO GOOGLE SHEETS</h2>
        <p className="text-gray-400 text-xs tracking-widest">
          Export {patientCount} patient record{patientCount !== 1 ? "s" : ""} to Google Sheets
        </p>
      </div>

      {/* Information */}
      <div className="bg-[#0a1628] border border-[#1e90ff] [border-color:rgba(30,144,255,0.2)] rounded-sm p-4">
        <p className="text-gray-300 text-sm mb-2">
          <strong>Headers that will be created:</strong>
        </p>
        <ul className="text-gray-400 text-xs space-y-1 ml-4">
          <li>• Registration Number</li>
          <li>• PLHIV Number</li>
          <li>• Patient Name</li>
          <li>• Guardian Name</li>
          <li>• Contact Number</li>
          <li>• Residential Address</li>
          <li>• Sync Date</li>
        </ul>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Spreadsheet ID */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            Google Sheets Spreadsheet ID *
          </label>
          <input
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="e.g., 1BxiMVs0XRA5nFMKUVfIstQajgm6YQwWc"
            className="blueprint-input"
            disabled={syncMutation.isPending}
          />
          <p className="text-gray-500 text-xs mt-2">
            Find this in your Google Sheets URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
          </p>
        </div>

        {/* Sheet Name */}
        <div>
          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
            Sheet Name
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="e.g., Patients"
            className="blueprint-input"
            disabled={syncMutation.isPending}
          />
          <p className="text-gray-500 text-xs mt-2">
            The sheet will be created if it doesn't exist
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-[#0a1628] border border-[#ffb74d] [border-color:rgba(30,144,255,0.2)] rounded-sm p-4">
        <p className="text-[#ffb74d] text-xs tracking-widest font-bold mb-2">[ IMPORTANT ]</p>
        <p className="text-gray-400 text-sm">
          Make sure you have edit access to the spreadsheet. The sync will append data to the specified sheet.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-[#1e90ff] [border-color:rgba(30,144,255,0.2)]">
        <button
          type="button"
          onClick={onClose}
          disabled={syncMutation.isPending}
          className="flex-1 px-4 py-2 border border-[#1e90ff] [border-color:rgba(30,144,255,0.4)] text-white hover:bg-[#1e90ff] hover:[background-color:rgba(30,144,255,0.1)] transition-colors text-sm font-bold uppercase tracking-wider disabled:opacity-50"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={syncMutation.isPending || !spreadsheetId.trim()}
          className="flex-1 blueprint-btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncMutation.isPending ? "SYNCING..." : "SYNC NOW"}
        </button>
      </div>
    </form>
  );
}
