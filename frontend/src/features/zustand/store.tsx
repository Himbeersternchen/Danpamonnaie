import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createAuthSlice } from "../auth/zustand/authSlice";
import { createDashboardSlice } from "../dashboard/zustand/slice";
import { DanpaState } from "./stateTypes";

export const useDanpaStore = create<DanpaState>()(
  devtools((...a) => ({
    ...createDashboardSlice(...a),
    ...createAuthSlice(...a),
  }))
);
