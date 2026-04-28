import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { Dashboard } from "./features/dashboard/ui/container/Dashboard";
import { Tutorial } from "./features/tutorial/Tutorial";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "tutorial",
          element: <Tutorial />,
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
