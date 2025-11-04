export interface Group {
  id: string;
  name: string;
  amount: number;
  members: Member[];
  duration: number;
  startDate: string;
  status: 'active' | 'completed' | 'pending';
  currentMonth: number;
  nextDrawDate: string;
  progress: number;
  lastWinner?: string;
  agreement: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  hasPaid: boolean;
  hasWon: boolean;
  joinDate: string;
}

export interface Notification {
  id: string;
  type: 'payment_due' | 'payment_paid' | 'spin_reminder' | 'draw_result' | 'group_invite' | 'agreement_pending';
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
  phone: string;
  age: number;
  upiId: string;
  profilePicture?: string;
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
