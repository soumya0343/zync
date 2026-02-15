import api from "./api";

export interface CreateBoardDto {
  title: string;
}

export interface CreateColumnDto {
  boardId: string;
  title: string;
  order: number;
}

export const boardService = {
  getBoards: async () => {
    const response = await api.get("/boards");
    return response.data;
  },

  createBoard: async (data: CreateBoardDto) => {
    const response = await api.post("/boards", data);
    return response.data;
  },

  getBoard: async (id: string) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  createColumn: async (data: CreateColumnDto) => {
    const response = await api.post("/boards/columns", data);
    return response.data;
  },
};
