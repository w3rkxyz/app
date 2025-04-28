import { ethers } from "ethers";
import CONTRACT from "./contracts/ContractsManager.json";
import PROFILECONTRACT from "./contracts/ProfileCreator.json";
import PERMISSIONCONTRACT from "./contracts/PermissionlessCreator.json";
import TOKEN from "./contracts/Link.json";
import { openLoader, closeLoader, closeAlert, openAlert } from "./redux/alerts";
import axios from "axios";
import type { activeContractDetails, contractDetails } from "./types/types";
import unicrow from "@unicrowio/sdk";
import { uploadJsonToIPFS } from "./utils/uploadToIPFS";
import { createNotification, Notification, NotificationType } from "@/utils/firebase";

// Configure provider with rate limiting and retry logic
const rpc_url = `https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`;
const providerOptions = {
  batchMaxCount: 1, // Process one request at a time
  retryDelay: 1000, // Wait 1 second between retries
  pollingInterval: 1000, // Poll every 1 second
};

let provider = new ethers.JsonRpcProvider(rpc_url, undefined, providerOptions);

unicrow.config({
  chainId: BigInt(421614),
});

let contractInstance = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
  CONTRACT.abi,
  provider
);

function secondsUntil(targetDate: Date) {
  const now = new Date();
  const dueDate = new Date(targetDate);
  const difference = dueDate.getTime() - now.getTime();
  return Math.floor(difference / 1000);
}

const getSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);

  const currentChainId = await provider.getNetwork().then(network => network.chainId);

  // Switch to Arbitrum Sepolia if not already switched
  if (Number(currentChainId) !== 421614) {
    // window.location.href = "/";
    await provider.send("wallet_switchEthereumChain", [{ chainId: "0x66eee" }]);
  }

  const signer = await provider.getSigner();
  return signer;
};

const getPolygonSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);

  const currentChainId = await provider.getNetwork().then(network => network.chainId);

  // Switch to Arbitrum Sepolia if not already switched
  // if (Number(currentChainId) !== 421614) {
  //   window.location.href = "/";
  //   await provider.send("wallet_switchEthereumChain", [{ chainId: "0x66eee" }]);
  // }

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

const getProfileContract = async () => {
  const signer = await getPolygonSigner();
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_PROFILE_CONTRACT_ADDRESS as string,
    PROFILECONTRACT.abi,
    signer
  );
  return contract;
};

const getPermissionContract = async () => {
  const signer = await getPolygonSigner();
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_PERMISSION_CONTRACT_ADDRESS as string,
    PERMISSIONCONTRACT.abi,
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
  const tokenBalanceString = await getTokenBalance(address);
  const tokenBalance = Number(tokenBalanceString);

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
          tag1: `Insufficient Balance`,
          tag2: `${amount} Tokens Required`,
        },
      })
    );
    setTimeout(() => {
      dispatch(closeAlert());
    }, 10000);
    return false;
  } else {
    try {
      const approvalTx = await contract.approve(
        approvalAddress,
        ethers.parseEther(amount.toString())
      );

      await approvalTx.wait();
      return true;
    } catch (error: any) {
      console.log("Error: ", error);
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
    console.log("Got here 1");
    const tx = await txFunction();
    console.log("Got here 2");
    await tx.wait();
    console.log("Got here 3");
    dispatch(closeLoader());
    return createTransactionLink(tx.hash);
  } catch (error: any) {
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
  dispatch: any,
  senderHandle?: string
) => {
  console.log("Handle: ", senderHandle);
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
        text: "Creating Contract proposal",
      })
    );
    const result = await handleContractTransaction(
      () => contract.createProposal(ethers.parseEther(amount), freelancersAddress, escrowData),
      dispatch
    );

    if (result) {
      // Only create notification if the transaction was successful
      const notificationData: Omit<Notification, "id" | "createdAt" | "read"> & {
        senderHandle?: string;
      } = {
        type: "contract_offer" as NotificationType,
        title: "New Contract Offer",
        message: `You have received a new contract offer for ${amount}`,
        address: freelancersAddress,
        contractId: result,
        ...(senderHandle ? { senderHandle } : {}),
      };

      await createNotification(notificationData);
      return result;
    } else {
      // Show error alert if transaction failed
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Transaction Failed",
            tag1: "Failed to create contract proposal",
            tag2: "Please try again later",
          },
        })
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 10000);
      return undefined;
    }
  } else {
    return undefined;
  }
};

const contractState = ["proposal", "inProgress", "awaitingApproval", "openDispute", "completed"];

const get_all_contracts = async (user: string) => {
  try {
    const contract = contractInstance;
    const [proposals, contracts_data] = await Promise.all([
      contract.get_proposals(user),
      contract.get_contracts(user),
    ]);

    const contracts: any = [];
    const batchSize = 5; // Process 5 requests at a time

    // Process proposals in batches
    for (let i = 0; i < proposals.length; i += batchSize) {
      const batch = proposals.slice(i, i + batchSize);
      const batchPromises = batch.map(async (proposal: any, index: number) => {
        try {
          const response = await axios.get(proposal.data as string);
          contracts.push({ ...response.data, state: "proposal", id: index });
        } catch (error) {
          console.error("Error fetching proposal data:", error);
        }
      });
      await Promise.all(batchPromises);
    }

    // Process contracts in batches
    for (let i = 0; i < contracts_data.length; i += batchSize) {
      const batch = contracts_data.slice(i, i + batchSize);
      const batchPromises = batch.map(async (contract: any, index: number) => {
        try {
          const response = await axios.get(contract.data as string);
          contracts.push({
            ...response.data,
            state: contractState[Number(contract.state)],
            id: index,
            escrowId: Number(contract.escrow_id),
          });
        } catch (error) {
          console.error("Error fetching contract data:", error);
        }
      });
      await Promise.all(batchPromises);
    }

    return contracts;
  } catch (error) {
    console.error("Error in get_all_contracts:", error);
    return [];
  }
};

const accept_proposal = async (
  proposalId: number,
  contractDetails: contractDetails,
  dispatch: any,
  senderHandle?: string
) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Accepting Contract proposal",
    })
  );
  const contract = await getContract();

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

  // Create notification for the client
  const notificationData: Omit<Notification, "id" | "createdAt" | "read"> & {
    senderHandle?: string;
  } = {
    type: "contract_accepted" as NotificationType,
    title: "Contract Accepted",
    message: "Your contract offer has been accepted",
    address: contractDetails.freelancerAddress,
    contractId: result,
    ...(senderHandle ? { senderHandle } : {}),
  };

  await createNotification(notificationData);
  return result;
};

const reject_proposal = async (proposalId: number, dispatch: any) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Rejecting Contract proposal",
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
      text: "Cancling Contract proposal",
    })
  );
  const contract = await getContract();

  const result = await handleContractTransaction(
    () => contract.cancle_proposal(proposalId),
    dispatch
  );

  return result;
};

const request_extension = async (
  contractId: number,
  contractDetails: activeContractDetails,
  new_date: Date,
  dispatch: any
) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Requesting Contract Extension",
    })
  );
  const contract = await getContract();

  const newContract = { ...contractDetails };
  newContract.dueDate = new_date;
  const escrowData = await uploadJsonToIPFS(newContract);

  const result = await handleContractTransaction(
    () => contract.update_contract_data(contractId, escrowData),
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

// Profile Creator
const create_new_profile = async (handle: string, address: string, dispatch: any) => {
  const contract = await getProfileContract();

  console.log("Handle: ", handle);

  const createProfileParams = {
    to: address,
    followModule: "0x0000000000000000000000000000000000000000",
    followModuleInitData: "0x",
  };

  console.log("Params", createProfileParams);

  const tx = await contract.create_lens_profile(createProfileParams, handle, [
    "0x71990499e005Db4d7854eea564023AB64ca884b5",
  ]);
  await tx.wait();
  console.log("Result: ", tx);
  return "Success!";
};

const create_profile = async (handle: string, address: string, dispatch: any) => {
  const contract = await getPermissionContract();

  const createProfileParams = {
    to: address,
    followModule: "0x0000000000000000000000000000000000000000",
    followModuleInitData: "0x",
  };

  const tx = await contract.createProfileWithHandle(createProfileParams, handle, [
    "0x71990499e005Db4d7854eea564023AB64ca884b5",
  ]);
  await tx.wait();
  return "Success!";
};

const get_score = async (address: string) => {
  const contract = contractInstance;

  const score_raw = await contract.score(address);
  return Number(score_raw);
};

export {
  create_proposal,
  get_all_contracts,
  accept_proposal,
  reject_proposal,
  cancle_proposal,
  request_extension,
  request_payement,
  release_payement,
  getContract,
  create_new_profile,
  create_profile,
  get_score,
  contractInstance,
};
