import api from './api';

export interface KuriListResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    monthlyAmount: number;
    status: 'active' | 'pending' | 'completed';
    myRole: 'admin' | 'member';
    nextDueDate: string | null;
    totalMembers: number;
    adminName: string;
  }[];
}

export interface KuriDetailsResponse {
  id: string;
  name: string;
  description: string;
  monthlyAmount: number;
  status: 'active' | 'pending' | 'completed';
  adminId: string;
  memberIds: string[];
  members: {
    id: string;
    name: string;
    uniqueCode: string;
    avatar: string;
    role: 'admin' | 'member';
  }[];
  payments: {
    memberId: string;
    month: number;
    status: 'paid' | 'unpaid';
    paidDate?: string;
  }[];
  winners?: {
    memberId: string;
    month: number;
  }[];
}

export interface CreateKuriRequest {
  name: string;
  monthlyAmount: number;
  description: string;
  duration: string;
  startDate: string;
  joinAsMember: boolean;
}

export interface CreateKuriResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    status: string;
    adminId: string;
  };
}

export interface UpdateKuriRequest {
  name?: string;
  monthlyAmount?: number;
  description?: string;
  memberIds?: string[];
  payments?: {
    memberId: string;
    month: number;
    status: 'paid' | 'unpaid';
  }[];
  winners?: {
    month: number;
    memberId: string;
  }[];
}

export interface AddMemberRequest {
  type: 'existing' | 'dummy';
  userId?: string;
  name?: string;
}

export interface AddMemberResponse {
  success: boolean;
  message: string;
  member: {
    id: string;
    name: string;
    uniqueCode: string;
    isDummy?: boolean;
  };
}

export const kuriService = {
  async getMyKuris(userId?: string): Promise<KuriListResponse> {
    const response = await api.get(`/kuris?userId=${userId}`);
    return response.data;
  },

  async getKuriDetails(kuriId: string): Promise<KuriDetailsResponse> {
    const response = await api.get(`/kuris/${kuriId}`);
    return response.data;
  },

  async createKuri(kuriData: CreateKuriRequest): Promise<CreateKuriResponse> {
    const response = await api.post('/kuris', kuriData);
    return response.data;
  },

  async updateKuri(
    kuriId: string,
    updates: UpdateKuriRequest,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/kuris/${kuriId}`, updates);
    return response.data;
  },

  async updateMembers(
    kuriId: string,
    memberIds: string[],
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/kuris/${kuriId}`, { memberIds });
    return response.data;
  },

  async updatePayments(
    kuriId: string,
    payments: { memberId: string; month: number; status: 'paid' | 'unpaid' }[],
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/kuris/${kuriId}`, { payments });
    return response.data;
  },

  async updateWinners(
    kuriId: string,
    winners: { month: number; memberId: string }[],
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/kuris/${kuriId}`, { winners });
    return response.data;
  },

  async deleteKuri(
    kuriId: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/kuris/${kuriId}`);
    return response.data;
  },

  async addMember(
    kuriId: string,
    memberData: AddMemberRequest,
  ): Promise<AddMemberResponse> {
    const response = await api.post(`/kuris/${kuriId}/members`, memberData);
    return response.data;
  },
};
