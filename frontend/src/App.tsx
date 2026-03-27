import { useLayoutEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { LoginModal } from "./features/auth/ui/LoginModal";
import { UploadTransactionModal } from "./features/auth/ui/UploadTransactionModal";
import { useDanpaStore } from "./features/zustand/store";
import { Page } from "./resuable-ui/layout/Page";

export default function App() {
  const isLoginModalOpen = useDanpaStore((state) => state.isLoginModalOpen);
  const closeLoginModal = useDanpaStore((state) => state.closeLoginModal);
  const isUploadModalOpen = useDanpaStore((state) => state.isUploadModalOpen);
  const closeUploadModal = useDanpaStore((state) => state.closeUploadModal);
  const checkAuth = useDanpaStore((state) => state.checkAuth);

  useLayoutEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Page minHeight="screen" background="gray-50" padding="none">
      <Navbar />
      <Outlet />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <UploadTransactionModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
      />
    </Page>
  );
}
