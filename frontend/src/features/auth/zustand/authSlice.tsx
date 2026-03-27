import { StateCreator } from "zustand";
import { getProfile, loginUser, logoutUser } from "../services/authApi";
import { BankAccount, getUserBanks } from "../services/uploadApi";
import { AuthState, LoginCredentials } from "../types";

export interface AuthSlice extends AuthState {
  isLoginModalOpen: boolean;
  isUploadModalOpen: boolean;
  bankAccounts: BankAccount[];
  bankAccountsLoading: boolean;
  bankAccountsError: string | null;
  isCheckingAuth: boolean;
  hasCheckedAuth: boolean;
  selectedAccountId: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchBankAccounts: () => Promise<void>;
  setSelectedAccountId: (accId: string | null) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoginModalOpen: false,
  isUploadModalOpen: false,
  bankAccounts: [],
  bankAccountsLoading: false,
  bankAccountsError: null,
  isCheckingAuth: false,
  hasCheckedAuth: false,
  selectedAccountId: null, // Will be set to first account when accounts are fetched

  login: async (credentials) => {
    try {
      const response = await loginUser(credentials);
      set({
        isAuthenticated: response.detail === "ok",
        user: {
          username: response.username,
          nickname: response.nickname,
          email: response.email,
        },
      });
      // Fetch bank accounts after successful login
      if (response.detail === "ok") {
        await get().fetchBankAccounts();
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
    set({
      isAuthenticated: false,
      user: null,
      bankAccounts: [],
      bankAccountsLoading: false,
      bankAccountsError: null,
      isCheckingAuth: false,
      hasCheckedAuth: true,
      selectedAccountId: null,
    });
  },

  checkAuth: async () => {
    const state = get();

    // Prevent concurrent or duplicate auth checks
    if (state.isCheckingAuth || state.hasCheckedAuth) {
      return;
    }

    set({ isCheckingAuth: true });

    try {
      const user = await getProfile();
      set({
        isAuthenticated: true,
        user,
        isCheckingAuth: false,
        hasCheckedAuth: true,
      });
      // Fetch bank accounts after successful auth check
      await get().fetchBankAccounts();
    } catch {
      // If profile fetch fails, user is not authenticated
      set({
        isAuthenticated: false,
        user: null,
        isCheckingAuth: false,
        hasCheckedAuth: true,
      });
    }
  },

  fetchBankAccounts: async () => {
    set({
      bankAccountsLoading: true,
      bankAccountsError: null,
    });

    try {
      const bankAccounts = await getUserBanks();

      // Determine which account to select: current > cached > first
      const nickname = get().user?.nickname;
      const cachedId = nickname
        ? localStorage.getItem(`danpa_selected_account_${nickname}`)
        : null;
      const currentSelectedId = get().selectedAccountId;

      let newSelectedId = currentSelectedId;
      if (
        !newSelectedId &&
        cachedId &&
        bankAccounts.some((a) => a.acc_id === cachedId)
      ) {
        newSelectedId = cachedId;
      }
      if (!newSelectedId && bankAccounts.length > 0) {
        newSelectedId = bankAccounts[0].acc_id;
      }

      set({
        bankAccounts,
        bankAccountsLoading: false,
        bankAccountsError: null,
        selectedAccountId: newSelectedId,
      });
    } catch (error) {
      set({
        bankAccounts: [],
        bankAccountsLoading: false,
        bankAccountsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch bank accounts",
      });
    }
  },

  openLoginModal: () => {
    set({ isLoginModalOpen: true });
  },

  closeLoginModal: () => {
    set({ isLoginModalOpen: false });
  },

  openUploadModal: () => {
    set({ isUploadModalOpen: true });
  },

  closeUploadModal: () => {
    set({ isUploadModalOpen: false });
  },

  setSelectedAccountId: (accId) => {
    const nickname = get().user?.nickname;
    if (nickname && accId) {
      localStorage.setItem(`danpa_selected_account_${nickname}`, accId);
    }
    set({ selectedAccountId: accId });
  },
});
