import api from "./api";

export interface CreateCheckInDto {
  content: string;
  mood: string; // "great" | "good" | "okay" | "bad"
  tags?: string[];
  isPublic?: boolean;
  date?: string;
}

export interface UpdateCheckInDto {
  content?: string;
  mood?: string;
  tags?: string[];
  isPublic?: boolean;
  date?: string;
}

export const checkInService = {
  getCheckIns: async () => {
    const response = await api.get("/checkins");
    return response.data;
  },

  createCheckIn: async (data: CreateCheckInDto) => {
    const response = await api.post("/checkins", data);
    return response.data;
  },

  updateCheckIn: async (id: string, data: UpdateCheckInDto) => {
    const response = await api.put(`/checkins/${id}`, data);
    return response.data;
  },

  deleteCheckIn: async (id: string) => {
    const response = await api.delete(`/checkins/${id}`);
    return response.data;
  },
};
