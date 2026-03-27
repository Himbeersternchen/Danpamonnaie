import { AuthSlice } from "../auth/zustand/authSlice";
import { DashboardSlice } from "../dashboard/types/state";

export type DanpaState = DashboardSlice & AuthSlice;
