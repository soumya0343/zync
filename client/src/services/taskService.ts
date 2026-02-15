import api from "./api";

export interface CreateTaskDto {
  title: string;
  columnId: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  parentId?: string;
  goalId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  columnId?: string;
  order?: number;
  goalId?: string;
  parentId?: string;
}

export const taskService = {
  createTask: async (data: CreateTaskDto) => {
    const response = await api.post("/tasks", data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskDto) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getTask: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
};
