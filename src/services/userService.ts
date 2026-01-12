import api from './api';

export interface SearchUserResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export const userService = {
  async searchUserByCode(code: string): Promise<SearchUserResponse> {
    const response = await api.get('/users/search', {
      params: { code }
    });
    return response.data;
  }
};
