import { api } from "@/lib/api";
import { IAnalyticsOverview } from "@/types";

export interface GetAnalyticsParams {
  fromDate?: string;
  toDate?: string;
}

export const analyticsService = {
  async getOverview(params: GetAnalyticsParams = {}): Promise<{ data: IAnalyticsOverview }> {
    const res = await api.get("/analytics/overview", { params });
    return res.data;
  },
};
