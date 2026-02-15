import api from "./api";

export interface CreateCheckInDto {
  content: string;
  mood: string;
  focusedHours?: number;
  reflections?: string;
  tags?: string[];
  isPublic?: boolean;
  date?: string;
}

export interface UpdateCheckInDto {
  content?: string;
  mood?: string;
  focusedHours?: number;
  reflections?: string;
  tags?: string[];
  isPublic?: boolean;
  date?: string;
}

export interface CheckInEntry {
  id: string;
  date: string;
  content: string;
  mood: string | null;
  focusedHours: number | null;
  reflections: string | null;
  tags: string[];
  isPublic: boolean;
  userId: string;
  updatedAt: string;
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
