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
  clientHandle: string;
  freelancerHandle: string;
  paymentAmount: number;
  dueDate: Date;
  state: string;
}

interface activeContractDetails {
  title: string;
  description: string;
  clientAddress: string;
  freelancerAddress: string;
  paymentAmount: number;
  dueDate: Date;
  state: string;
  clientHandle: string;
  freelancerHandle: string;
  id?: number;
  escrowId?: number;
}

export type { contractDetails, workData, activeContractDetails };
