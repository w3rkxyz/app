import { ethers } from "ethers";
import CONTRACT from "./contracts/ContractsManager.json";
import TOKEN from "./contracts/Link.json";
import { openLoader, closeLoader, closeAlert, openAlert } from "./redux/alerts";
import axios from "axios";
import type { activeContractDetails, contractDetails } from "./types/types";
import unicrow from "@unicrowio/sdk";

const rpc_url =
  "https://arb-sepolia.g.alchemy.com/v2/c1QPiRYwHLQQnKKNb0wQJ-3FHE9TZWra";
let provider = new ethers.JsonRpcProvider(rpc_url);

unicrow.config({
  defaultNetwork: unicrow.DefaultNetwork.ArbitrumSepolia,
  autoSwitchNetwork: true,
});

let contractInstance = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
  CONTRACT.abi,
  provider
);

function secondsUntil(targetDate: Date) {
  const now = new Date();
  const dueDate = new Date(targetDate);
  console.log("Now: ", dueDate.getTime());
  const difference = dueDate.getTime() - now.getTime();
  return Math.floor(difference / 1000);
}

const getSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);

  const currentChainId = await provider
    .getNetwork()
    .then((network) => network.chainId);
  console.log("chain: ", Number(currentChainId));

  // Switch to Arbitrum Sepolia if not already switched
  if (Number(currentChainId) !== 421614) {
    window.location.href = "/";
    await provider.send("wallet_switchEthereumChain", [{ chainId: "0x66eee" }]);
  }

  const signer = await provider.getSigner();
  return signer;
};

const getContract = async () => {
  const signer = await getSigner();
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    CONTRACT.abi,
    signer
  );
  return contract;
};

const getTokenContract = async () => {
  const signer = await getSigner();
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS as string,
    TOKEN.abi,
    signer
  );
  return contract;
};

// creates a link to the transaction
const sepoliaScan = "https://sepolia.arbiscan.io/tx";

const createTransactionLink = (hash: any) => {
  return `${sepoliaScan}/${hash}`;
};

// Gets the users address
const getAddress = async () => {
  const signer = await getSigner();
  return signer.address;
};

// gets the users tokenBalance
const getTokenBalance = async (sender: any) => {
  const contract = await getTokenContract();
  const balance = await contract.balanceOf(sender);
  const balanceInEther = ethers.formatEther(balance);
  return balanceInEther;
};

/**
 * Transaction Handlers
 */

/**
 *
 * @param approvalAddress The address your approving token use for
 * @param amount The amount as a number in ether form
 * @param dispatch the redux dispatch object
 * @returns
 */
const handleTokenApproval = async (
  approvalAddress: string,
  amount: number,
  dispatch: any
): Promise<boolean> => {
  const address = await getAddress();
  const contract = await getTokenContract();
  console.log("Address: ", address);
  const tokenBalanceString = await getTokenBalance(address);
  const tokenBalance = Number(tokenBalanceString);
  console.log("Balance: ", tokenBalance);

  if (amount > tokenBalance) {
    dispatch(closeLoader());
    dispatch(
      openAlert({
        displayAlert: true,
        data: {
          id: 2,
          variant: "Failed",
          classname: "text-black",
          title: "Transaction Failed",
          tag1: `Insufficient balance: need ${amount} kover`,
          tag2: "please buy tokens before proceeding",
        },
      })
    );
    setTimeout(() => {
      dispatch(closeAlert());
    }, 10000);
    return false;
  } else {
    try {
      console.log("approving");
      const approvalTx = await contract.approve(
        approvalAddress,
        ethers.parseEther(amount.toString())
      );
      console.log("Reached here?");

      await approvalTx.wait();
      return true;
    } catch (error: any) {
      dispatch(closeLoader());
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Transaction Rejected",
            tag1: "User rejected transaction",
            tag2: "please confirm the transaction next time",
          },
        })
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 10000);
      return false;
    }
  }
};

/**
 *
 * @param txFunction The contract function your running
 * @param dispatch The redux dispatch object
 * @returns
 */
const handleContractTransaction = async (
  txFunction: () => Promise<any>,
  dispatch: any
): Promise<string | undefined> => {
  try {
    const tx = await txFunction();
    await tx.wait();
    dispatch(closeLoader());
    return createTransactionLink(tx.hash);
  } catch (error: any) {
    console.log("The error: ", error);
    dispatch(closeLoader());
    if (error.reason === "rejected") {
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Transaction Rejected",
            tag1: "User rejected transaction",
            tag2: "please confirm the transaction next time",
          },
        })
      );
    } else if (error.reason) {
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Transaction Failed",
            tag1: error.reason,
            tag2: "please try again later",
          },
        })
      );
    } else {
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Transaction Failed",
            tag1: "User rejected transaction",
            tag2: "please try again and confirm the transaction",
          },
        })
      );
    }
    setTimeout(() => {
      dispatch(closeAlert());
    }, 10000);
    return undefined;
  }
};

// -----------------------------------------------------------------------------------------------------------------------------------------

// Application
const create_proposal = async (
  amount: string,
  freelancersAddress: string,
  escrowData: string,
  dispatch: any
) => {
  const contract = await getContract();

  const tokensApproved = await handleTokenApproval(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    Number(amount),
    dispatch
  );

  if (tokensApproved) {
    dispatch(
      openLoader({
        displaytransactionLoader: true,
        text: "Creating proposal",
      })
    );
    const result = await handleContractTransaction(
      () =>
        contract.createProposal(
          ethers.parseEther(amount),
          freelancersAddress,
          escrowData
        ),
      dispatch
    );

    return result;
  } else {
    return undefined;
  }
};

const contractState = [
  "proposal",
  "inProgress",
  "awaitingApproval",
  "openDispute",
  "completed",
];

const get_all_contracts = async (user: string) => {
  const contract = await getContract();
  const proposals = await contract.get_proposals();
  const contracts_data = await contract.get_contracts();

  const contracts: any = [];

  const axiosRequests = proposals.map(async (proposal: any, index: number) => {
    const response = await axios.get(proposal.data as string);

    contracts.push({ ...response.data, state: "proposal", id: index });
  });
  await Promise.all(axiosRequests);

  const axiosContractRequests = contracts_data.map(
    async (contract: any, index: number) => {
      const response = await axios.get(contract.data as string);

      contracts.push({
        ...response.data,
        state: contractState[Number(contract.state)],
        id: index,
        escrowId: Number(contract.escrow_id),
      });
    }
  );
  await Promise.all(axiosContractRequests);
  console.log("Contracts: ", contracts);
  return contracts;
};

const accept_proposal = async (
  proposalId: number,
  contractDetails: contractDetails,
  dispatch: any
) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Accepting proposal",
    })
  );
  const contract = await getContract();

  console.log(contractDetails);

  const contractParams = [
    contractDetails.clientAddress,
    contractDetails.freelancerAddress,
    secondsUntil(contractDetails.dueDate),
    ethers.parseEther(contractDetails.paymentAmount.toString()),
    "w3rk",
  ];

  const result = await handleContractTransaction(
    () =>
      contract.acceptProposal(
        proposalId,
        contractParams,
        ethers.parseEther(contractDetails.paymentAmount.toString())
      ),
    dispatch
  );

  return result;
};

const reject_proposal = async (proposalId: number, dispatch: any) => {
  console.log("Id: ", proposalId);
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Rejecting proposal",
    })
  );
  const contract = await getContract();

  const result = await handleContractTransaction(
    () => contract.rejectProposal(proposalId),
    dispatch
  );

  return result;
};

const cancle_proposal = async (proposalId: number, dispatch: any) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Cancling proposal",
    })
  );
  const contract = await getContract();

  const result = await handleContractTransaction(
    () => contract.cancle_proposal(proposalId),
    dispatch
  );

  return result;
};

const request_payement = async (contractId: number, dispatch: any) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Requesting Payement",
    })
  );
  const contract = await getContract();

  const result = await handleContractTransaction(
    () => contract.request_payement(contractId),
    dispatch
  );

  return result;
};

const release_payement = async (
  contractId: number,
  contractDetails: activeContractDetails,
  dispatch: any
) => {
  if (contractDetails.escrowId) {
    dispatch(
      openLoader({
        displaytransactionLoader: true,
        text: "Releasing Payement",
      })
    );
    const contract = await getContract();

    const result = await handleContractTransaction(
      () => contract.release_payement(contractId),
      dispatch
    );
    await unicrow.core.release(contractDetails.escrowId);

    return result;
  } else {
    alert("Not an active contract");
  }
};

export {
  create_proposal,
  get_all_contracts,
  accept_proposal,
  reject_proposal,
  cancle_proposal,
  request_payement,
  release_payement,
  getContract,
  contractInstance,
};
