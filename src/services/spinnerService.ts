import api from './api';

export interface SpinRequest {
  easing: string;
  speed: number;
  rotates: number;
  winner: string;
  adminId: string;
}

export interface SpinResponse {
  success: boolean;
  message: string;
}

export const spinnerService = {
  async sendSpin(kuriId: string, spinData: SpinRequest): Promise<SpinResponse> {
    const response = await api.post(`/spinner/spin/${kuriId}`, spinData);
    return response.data;
  },
};
