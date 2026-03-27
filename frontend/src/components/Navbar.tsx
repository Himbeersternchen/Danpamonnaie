import { useLocation } from "react-router-dom";
import { AvatarMenuButton } from "../features/auth/ui/AvatarMenuButton";
import { DateRangePickerRSuit } from "../features/dashboard/ui/components/DateRangePickerRSuit";
import { useDanpaStore } from "../features/zustand/store";
import useWindowWidth from "../hooks/useWindowWidth";
import { Button } from "../resuable-ui/form/Button";
import { Container } from "../resuable-ui/layout/Container";
import { Flex } from "../resuable-ui/layout/Flex";
import { Nav } from "../resuable-ui/navigation/Nav";
import { NavLink } from "../resuable-ui/navigation/NavLink";
import SplitText from "./SplitText";

export function Navbar() {
  const location = useLocation();
  const isAuthenticated = useDanpaStore((state) => state.isAuthenticated);
  const user = useDanpaStore((state) => state.user);
  const logout = useDanpaStore((state) => state.logout);
  const openLoginModal = useDanpaStore((state) => state.openLoginModal);
  const openUploadModal = useDanpaStore((state) => state.openUploadModal);
  const bankAccounts = useDanpaStore((state) => state.bankAccounts);
  const selectedAccountId = useDanpaStore((state) => state.selectedAccountId);
  const setSelectedAccountId = useDanpaStore(
    (state) => state.setSelectedAccountId
  );

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === "/dashboard" && location.pathname === "/");

  const handleLogout = async () => {
    await logout();
  };

  const userControl =
    isAuthenticated && user ? (
      <AvatarMenuButton
        nickname={user.nickname}
        bankAccounts={bankAccounts}
        selectedAccountId={selectedAccountId}
        onLogout={handleLogout}
        onUploadClick={openUploadModal}
        onAccountSelect={setSelectedAccountId}
      />
    ) : (
      <Button
        className="pointer-events-auto"
        variant="primary"
        size="sm"
        onClick={openLoginModal}
      >
        Login
      </Button>
    );

  return (
    <Nav className="relative bg-transparent">
      <Container className="relative z-10 pointer-events-none">
        {/* Main row */}
        <Flex justify="between" className={isMobile ? "h-12" : "h-16"}>
          <Flex align="center" className="flex-shrink-0 gap-2 sm:gap-4">
            <SplitText
              text="Danpamonnaie"
              className="text-xl font-bold text-center"
              delay={120}
              duration={1.2}
              ease="elastic.out(0.8, 0.5)"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
            {/* DateRangePicker: desktop only in the main row */}
            {!isMobile && (
              <DateRangePickerRSuit
                className="pointer-events-auto"
                size="sm"
                showWeekNumbers
              />
            )}
          </Flex>
          <Flex align="center" gap={4}>
            {/* Nav links: hidden on mobile */}
            {!isMobile && (
              <>
                <NavLink
                  className="h-16 px-[16px] pointer-events-auto"
                  to="/dashboard"
                  isActive={isActive("/dashboard")}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  className="h-16 px-[16px] pointer-events-auto"
                  to="/tutorial"
                  isActive={isActive("/tutorial")}
                >
                  Tutorial
                </NavLink>
              </>
            )}
            {userControl}
          </Flex>
        </Flex>

        {/* Mobile-only: DateRangePicker in a second row below the main row */}
        {isMobile && (
          <div className="pb-2 pointer-events-auto">
            <DateRangePickerRSuit size="sm" showWeekNumbers />
          </div>
        )}
      </Container>
    </Nav>
  );
}
