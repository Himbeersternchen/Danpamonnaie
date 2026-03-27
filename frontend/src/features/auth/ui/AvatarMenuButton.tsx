import { AlertCircle, Building2, Check, LogOut, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BankAccount } from "../services/uploadApi";

interface AvatarMenuButtonProps {
  nickname: string;
  bankAccounts: BankAccount[];
  selectedAccountId: string | null;
  onLogout: () => void;
  onUploadClick: () => void;
  onAccountSelect: (accId: string | null) => void;
}

export function AvatarMenuButton({
  nickname,
  bankAccounts,
  selectedAccountId,
  onLogout,
  onUploadClick,
  onAccountSelect,
}: AvatarMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const initials = nickname.charAt(0).toUpperCase();

  const handleUploadClick = () => {
    onUploadClick();
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  const handleAccountSelect = (accId: string | null) => {
    onAccountSelect(accId);
    setIsOpen(false);
  };

  const formatAccountDisplay = (account: BankAccount) => {
    const last4Digits = account.iban.slice(-4);
    return `${account.bank_name} - ${last4Digits}`;
  };

  return (
    <div className="relative pointer-events-auto" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center font-medium text-sm hover:scale-105 active:scale-100 transition-all duration-200 shadow-md"
        title={nickname}
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-64 z-50">
          <div className="p-2">
            <button
              onClick={handleUploadClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV</span>
            </button>

            {/* Account Selector */}
            <div className="border-t border-gray-200 my-2"></div>
            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account Filter
            </div>
            {bankAccounts.length > 0 ? (
              <>
                {bankAccounts.map((account) => (
                  <button
                    key={account.acc_id}
                    onClick={() => handleAccountSelect(account.acc_id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150"
                  >
                    <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="flex-1">
                      {formatAccountDisplay(account)}
                    </span>
                    {selectedAccountId === account.acc_id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2.5 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg mx-2 mb-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  No bank accounts found. Please add a bank account in the
                  database first.
                </span>
              </div>
            )}

            <div className="border-t border-gray-200 my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
