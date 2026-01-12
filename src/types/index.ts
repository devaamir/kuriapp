export interface Group {
  adminId: string;
  createdBy: string;
  description: string;
  duration: string;
  id: string;
  memberIds: string[];
  monthlyAmount: string;
  name: string;
  startDate: string;
  status: string;
  type: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  hasPaid: boolean;
  hasWon: boolean;
  joinDate: string;
  // API fields
  uniqueCode?: string;
  avatar?: string;
  role?: 'admin' | 'member';
  isDummy?: boolean;
}

export interface Notification {
  id: string;
  type:
    | 'payment_due'
    | 'payment_paid'
    | 'spin_reminder'
    | 'draw_result'
    | 'group_invite'
    | 'agreement_pending';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  groupId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  upiId?: string;
  profilePicture?: string;
  // API fields
  uniqueCode?: string;
  role?: string;
  avatar?: string;
  status?: string;
}

export interface Analytics {
  totalGroups: number;
  totalContributions: number;
  missedPayments: number;
  totalWins: number;
  contributionOverTime: { month: string; amount: number }[];
  completionRate: number;
  paidVsUnpaid: { paid: number; unpaid: number };
}
