import type { ApiResponse, FareClass, ListResponse, SeatClass } from "../../types/api";
import api from "../api-client";

export const seatClassesApi = {
  async getSeatClasses(page = 1, limit = 100): Promise<ListResponse<SeatClass>> {
    const response = await api.get<ApiResponse<ListResponse<SeatClass>>>(
      '/flights/seat-classes',
      { params: { page, limit } },
    );
    return response.data.data ?? { Items: [], Total: 0 };
  },

  async getSeatClassById(id: number): Promise<SeatClass | null> {
    const response = await api.get<ApiResponse<SeatClass>>(`/flights/seat-classes/${id}`);
    return response.data.data;
  },

   async getFareClasses(page = 1, limit = 100): Promise<ListResponse<FareClass>> {
    const response = await api.get<ApiResponse<ListResponse<FareClass>>>(
      '/flights/fare-classes',
      { params: { page, limit } },
    );
    return response.data.data ?? { Items: [], Total: 0 };
  },

  async getFareClassById(id: number): Promise<FareClass | null> {
    const response = await api.get<ApiResponse<FareClass>>(`/flights/fare-classes/${id}`);
    return response.data.data;
  },
}
