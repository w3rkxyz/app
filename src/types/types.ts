import { ProfileId } from "@lens-protocol/react-web";

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
  clientHandle: ProfileId;
  freelancerHandle: ProfileId;
  id?: number;
  escrowId?: number;
}

export type { contractDetails, workData, activeContractDetails };
