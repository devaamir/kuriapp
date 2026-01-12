import api from './api';

export interface SearchUserResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    uniqueCode?: string;
  }[] | {
    id: string;
    name: string;
    email: string;
    avatar: string;
    uniqueCode?: string;
  };
}

export const userService = {
  async searchUserByCode(code: string): Promise<SearchUserResponse> {
    const response = await api.get('/users/search', {
      params: { code }
    });
    return response.data;
  },

  async searchUsers(query: string): Promise<SearchUserResponse> {
    try {
      const response = await api.get('/users');
      console.log(response.data, 'response');

      if (response.data && Array.isArray(response.data)) {
        const allUsers = response.data;
        const lowerQuery = query.toLowerCase();
        const filtered = allUsers.filter((user: any) =>
          user.name?.toLowerCase().includes(lowerQuery) ||
          user.uniqueCode?.toLowerCase().includes(lowerQuery) ||
          user.email?.toLowerCase().includes(lowerQuery)
        );
        console.log(filtered, 'filtered');

        return filtered
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, data: [] };
    }
  }
};
