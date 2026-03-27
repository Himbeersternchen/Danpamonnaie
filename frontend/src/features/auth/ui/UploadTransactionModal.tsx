import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Heading } from "../../../resuable-ui/display/Heading";
import { Button } from "../../../resuable-ui/form/Button";
import { Modal } from "../../../resuable-ui/layout/Modal";
import { Stack } from "../../../resuable-ui/layout/Stack";
import { useDanpaStore } from "../../zustand/store";
import { uploadTransactionCSV } from "../services/uploadApi";

interface UploadTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadTransactionModal({
  isOpen,
  onClose,
}: UploadTransactionModalProps) {
  const bankAccounts = useDanpaStore((state) => state.bankAccounts);
  const bankAccountsLoading = useDanpaStore(
    (state) => state.bankAccountsLoading
  );
  const bankAccountsError = useDanpaStore((state) => state.bankAccountsError);
  const fetchValidDateRange = useDanpaStore(
    (state) => state.fetchValidDateRange
  );

  const [selectedBankName, setSelectedBankName] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    if (newFiles.length > 0) {
      setSelectedFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const unique = newFiles.filter((f) => !existingNames.has(f.name));
        return [...prev, ...unique];
      });
      setUploadError(null);
    }
    // Reset input so the same file can be re-selected in a future click
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (!selectedBankName || selectedFiles.length === 0) return;
    setUploadError(null);
    setAwaitingConfirm(true);
  };

  const handleConfirmUpload = async () => {
    setAwaitingConfirm(false);
    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadTransactionCSV(selectedBankName, selectedFiles);
      handleClose();
      fetchValidDateRange();
    } catch {
      setUploadError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedBankName("");
    setSelectedFiles([]);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  // Get unique bank names (remove duplicates)
  const uniqueBankNames = Array.from(
    new Set(bankAccounts.map((bank) => bank.bank_name))
  );

  const error = bankAccountsError || uploadError;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" blurBackground>
      <Stack spacing={4}>
        <Heading level={2} size="xl" className="text-center">
          Upload Transactions
        </Heading>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select bank to choose column mapping
          </label>
          <select
            value={selectedBankName}
            onChange={(e) => setSelectedBankName(e.target.value)}
            disabled={bankAccountsLoading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 text-sm disabled:bg-gray-100"
          >
            <option value="">
              {bankAccountsLoading ? "Loading banks..." : "Choose a bank..."}
            </option>
            {uniqueBankNames.map((bankName) => (
              <option key={bankName} value={bankName}>
                {bankName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CSV File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5 flex-shrink-0" />
            <span>Click to select file(s)</span>
          </button>
          {selectedFiles.length > 0 && (
            <ul className="mt-2 space-y-1">
              {selectedFiles.map((file) => (
                <li key={file.name} className="text-sm text-gray-700 break-all">
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {awaitingConfirm && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-md px-3 py-2 text-sm text-yellow-800">
            <p className="mb-2">
              Please confirm that all selected files belong to{" "}
              <strong>{selectedBankName}</strong>.
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleConfirmUpload}>
                Confirm & Upload
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setAwaitingConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!awaitingConfirm && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedBankName || selectedFiles.length === 0 || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        )}
      </Stack>
    </Modal>
  );
}
