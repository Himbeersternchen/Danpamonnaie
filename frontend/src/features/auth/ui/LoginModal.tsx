import { FormEvent, useState } from "react";
import { Heading } from "../../../resuable-ui/display/Heading";
import { Button } from "../../../resuable-ui/form/Button";
import { Input } from "../../../resuable-ui/form/Input";
import { Modal } from "../../../resuable-ui/layout/Modal";
import { Stack } from "../../../resuable-ui/layout/Stack";
import { useDanpaStore } from "../../zustand/store";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = useDanpaStore((state) => state.login);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ username, password });
      onClose();
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      blurBackground={true}
    >
      <Stack spacing={6}>
        {/* Logo/Icon */}
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-md border border-gray-700">
            <span className="text-3xl">💰</span>
          </div>
        </div>

        <Heading level={2} size="2xl" className="text-center text-gray-900">
          Welcome Back
        </Heading>
        <Heading
          level={3}
          size="sm"
          weight="normal"
          color="gray-600"
          className="text-center -mt-2"
        >
          Sign in to continue to Danpamonnaie
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 py-2 px-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              className="mt-2 bg-gray-900 hover:bg-gray-800 hover:scale-105 active:scale-100 shadow-md hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
}
