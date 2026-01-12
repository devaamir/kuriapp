import { Group, Member, Notification, User, Analytics } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+1234567890',
  age: 28,
  upiId: 'alex@paytm',
};

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    phone: '+1234567890',
    email: 'alex@example.com',
    hasPaid: true,
    hasWon: false,
    joinDate: '2024-01-01',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    phone: '+1234567891',
    email: 'sarah@example.com',
    hasPaid: true,
    hasWon: true,
    joinDate: '2024-01-01',
  },
  {
    id: '3',
    name: 'Mike Chen',
    phone: '+1234567892',
    email: 'mike@example.com',
    hasPaid: false,
    hasWon: false,
    joinDate: '2024-01-01',
  },
  {
    id: '4',
    name: 'Emma Davis',
    phone: '+1234567893',
    email: 'emma@example.com',
    hasPaid: true,
    hasWon: false,
    joinDate: '2024-01-01',
  },
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Friends Circle',
    monthlyAmount: '5000',
    memberIds: ['1', '2', '3', '4'],
    duration: '12 Months',
    startDate: '2024-01-01',
    status: 'active',
    adminId: '1',
    createdBy: '1',
    description: 'Monthly contribution of ₹5000. Draw on 15th of every month.',
    type: 'standard',
  },
  {
    id: '2',
    name: 'Office Team',
    monthlyAmount: '10000',
    memberIds: ['1', '2', '3'],
    duration: '6 Months',
    startDate: '2024-02-01',
    status: 'active',
    adminId: '2',
    createdBy: '2',
    description: 'Monthly contribution of ₹10000. Draw on 1st of every month.',
    type: 'standard',
  },
  {
    id: '3',
    name: 'Family Fund',
    monthlyAmount: '2000',
    memberIds: ['1', '2'],
    duration: '24 Months',
    startDate: '2023-01-01',
    status: 'completed',
    adminId: '1',
    createdBy: '1',
    description: 'Monthly contribution of ₹2000. Draw on 10th of every month.',
    type: 'standard',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment_due',
    title: 'Payment Due',
    message: 'Your payment for Friends Circle is due tomorrow',
    date: '2024-11-02',
    isRead: false,
    groupId: '1',
  },
  {
    id: '2',
    type: 'draw_result',
    title: 'Draw Result',
    message: "Sarah Wilson won this month's draw in Friends Circle",
    date: '2024-11-01',
    isRead: true,
    groupId: '1',
  },
  {
    id: '3',
    type: 'group_invite',
    title: 'Group Invitation',
    message: "You've been invited to join Tech Savers group",
    date: '2024-10-30',
    isRead: false,
  },
];

export const mockAnalytics: Analytics = {
  totalGroups: 3,
  totalContributions: 45000,
  missedPayments: 2,
  totalWins: 1,
  contributionOverTime: [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 17000 },
    { month: 'Mar', amount: 13000 },
  ],
  completionRate: 85,
  paidVsUnpaid: { paid: 12, unpaid: 3 },
};
