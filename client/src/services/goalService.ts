import api from "./api";

export interface CreateGoalDto {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  category?: string;
  progress?: number;
  dueDate?: string;
  taskIds?: string[];
}

export const goalService = {
  getGoals: async () => {
    const response = await api.get("/goals");
    return response.data;
  },

  createGoal: async (data: CreateGoalDto) => {
    const response = await api.post("/goals", data);
    return response.data;
  },

  updateGoal: async (id: string, data: UpdateGoalDto) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  deleteGoal: async (id: string) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
};
