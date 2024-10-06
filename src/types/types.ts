interface workData {
  username: string;
  profileImage: string;
  jobName: string;
  jobIcon: string;
  description: string;
  contractType: string;
  paymentAmount: string;
  paidIn: string;
  tags: string[];
}

interface contractDetails {
  title: string;
  description: string;
  clientAddress: string;
  freelancerAddress: string;
  paymentAmount: number;
  dueDate: Date;
}

export type { contractDetails, workData };
