import { ethers } from "ethers";
import CONTRACT from "./contracts/ContractsManager.json";
// Removed unused contract imports - ProfileCreator, PermissionlessCreator, Link.json no longer exist
// These were from the old architecture and are not needed for W3RK contract management
import { openLoader, closeLoader, closeAlert, openAlert } from "./redux/alerts";
import axios from "axios";
import type { activeContractDetails, contractDetails } from "./types/types";
// Unicrow SDK removed - not needed in frontend as contract handles all Unicrow interactions
// import unicrow from "@unicrowio/sdk";
// All contract data stored on-chain
import { createNotification, Notification, NotificationType } from "@/utils/notifications";
import { getCachedContracts, setCachedContracts } from "@/lib/contractCache";

// Lazy-load provider to avoid blocking initial page load
let provider: ethers.JsonRpcProvider | null = null;
let contractInstance: ethers.Contract | null = null;
const tokenDecimalsCache: Record<string, number> = {};

const getProvider = (): ethers.JsonRpcProvider => {
  if (!provider) {
    const rpc_url = process.env.NEXT_PUBLIC_LENS_RPC_URL || "https://rpc.testnet.lens.xyz";
    const providerOptions = {
      batchMaxCount: 1,
      retryDelay: 1000,
      pollingInterval: 1000,
    };
    provider = new ethers.JsonRpcProvider(rpc_url, undefined, providerOptions);
  }
  return provider;
};

const getContractInstance = (): ethers.Contract => {
  if (!contractInstance) {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error(
        "NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set. " +
        "Please check your .env file and ensure the contract address is configured."
      );
    }
    contractInstance = new ethers.Contract(
      contractAddress,
      CONTRACT.abi,
      getProvider()
    );
  }
  return contractInstance;
};

function secondsUntil(targetDate: Date) {
  const now = new Date();
  const dueDate = new Date(targetDate);
  const difference = dueDate.getTime() - now.getTime();
  return Math.floor(difference / 1000);
}

const getSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);

  const currentChainId = await provider.getNetwork().then(network => network.chainId);

  // Switch to Lens Chain Testnet if not already switched (Chain ID: 37111)
  if (Number(currentChainId) !== 37111) {
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x9117" }]);
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: "0x9117",
            chainName: "Lens Chain Testnet",
            nativeCurrency: {
              name: "GHO",
              symbol: "GHO",
              decimals: 18,
            },
            rpcUrls: ["https://rpc.testnet.lens.xyz"],
            blockExplorerUrls: ["https://block-explorer.testnet.lens.xyz"],
          },
        ]);
      }
    }
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

const resolveTokenAddress = (tokenAddress?: string): string => {
  const address = tokenAddress || process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
  if (!address) {
    throw new Error("Token address not provided");
  }
  return address;
};

// Standard ERC20 ABI for token interactions (balanceOf, approve, transfer, etc.)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

const getTokenContract = async (tokenAddress?: string) => {
  const signer = await getSigner();
  const contract = new ethers.Contract(
    resolveTokenAddress(tokenAddress),
    ERC20_ABI,
    signer
  );
  return contract;
};

// creates a link to the transaction on Lens Chain Block Explorer
const lensExplorer = "https://block-explorer.testnet.lens.xyz/tx";

const createTransactionLink = (hash: any) => {
  return `${lensExplorer}/${hash}`;
};

// Gets the users address
// Note: This returns the EOA address, not the Lens Account address
// Use user profile's address property for Lens Account address
const getAddress = async () => {
  const signer = await getSigner();
  return signer.address;
};

// Helper function to get token decimals dynamically
const getTokenDecimals = async (tokenAddress?: string): Promise<number> => {
  const address = resolveTokenAddress(tokenAddress);
  const contract = new ethers.Contract(address, ERC20_ABI, getProvider());
  try {
    const decimals = await contract.decimals();
    return Number(decimals);
  } catch (error) {
    console.warn("Failed to fetch token decimals, defaulting to 18:", error);
    return 18; // Default fallback
  }
};

const getTokenDecimalsCached = async (tokenAddress?: string): Promise<number> => {
  const address = resolveTokenAddress(tokenAddress).toLowerCase();
  if (address in tokenDecimalsCache) {
    return tokenDecimalsCache[address];
  }
  const decimals = await getTokenDecimals(address);
  tokenDecimalsCache[address] = decimals;
  return decimals;
};

// gets the users tokenBalance
// Fetches decimals dynamically from token contract
const getTokenBalance = async (sender: any, tokenAddress?: string) => {
  try {
    const contract = await getTokenContract(tokenAddress);
    const balance = await contract.balanceOf(sender);
    const tokenDecimals = await getTokenDecimalsCached(tokenAddress);
    const balanceFormatted = ethers.formatUnits(balance, tokenDecimals);
    return balanceFormatted;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
};

/**
 * Transaction Handlers
 */

/**
 *
 * @param approvalAddress The address your approving token use for
 * @param amount The amount as a number (in token units, e.g., 100 for 100 tokens)
 * @param dispatch the redux dispatch object
 * @param lensAccountAddress Optional: Lens Account address to check balance (if different from signer)
 * @returns
 */
const handleTokenApproval = async (
  approvalAddress: string,
  amount: number,
  dispatch: any,
  lensAccountAddress?: string, // Optional: Lens Account address (smart contract) to check balance
  tokenAddress?: string // Optional: Token address to use for decimals
): Promise<boolean> => {
  // Use Lens Account address if provided, otherwise use signer address
  // Lens Accounts can hold tokens directly
  const addressToCheck = lensAccountAddress || await getAddress();
  const contract = await getTokenContract(tokenAddress);
  const tokenDecimals = await getTokenDecimalsCached(tokenAddress);
  const tokenBalanceString = await getTokenBalance(addressToCheck, tokenAddress);
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
      // Use parseUnits with dynamically fetched decimals
      const approvalTx = await contract.approve(
        approvalAddress,
        ethers.parseUnits(amount.toString(), tokenDecimals)
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
      console.log("Error: ", error);
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
// NEW SIGNATURE: createProposal(amount, freelancerAccount, title, description, dueDate, tokenAddress)
// All data stored on-chain
// IMPORTANT: msg.sender must be the Lens Account address (not EOA)
// Token approvals must be done from the Lens Account that holds the tokens
const create_proposal = async (
  amount: string,
  freelancerAccountAddress: string, // Lens Account address (smart contract)
  title: string,
  description: string,
  dueDate: Date,
  tokenAddress: string,
  dispatch: any,
  senderHandle?: string,
  clientLensAccountAddress?: string // Optional: Client's Lens Account address for balance check
) => {
  console.log("Handle: ", senderHandle);
  const contract = await getContract();

  // Fetch token decimals dynamically
  const tokenDecimals = await getTokenDecimalsCached(tokenAddress);
  const amountParsed = ethers.parseUnits(amount, tokenDecimals);

  // Check balance on Lens Account (if provided), otherwise check signer
  // Note: Approval must be done by the account holding tokens (Lens Account)
  // This requires the Lens Account smart contract to execute the approval
  const tokensApproved = await handleTokenApproval(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    Number(amount),
    dispatch,
    clientLensAccountAddress, // Pass Lens Account address for balance check
    tokenAddress // Pass token address for decimals
  );

  if (tokensApproved) {
    dispatch(
      openLoader({
        displaytransactionLoader: true,
        text: "Creating Contract proposal",
      })
    );

    // Convert dueDate to Unix timestamp
    const dueDateTimestamp = Math.floor(dueDate.getTime() / 1000);

    const result = await handleContractTransaction(
      () => contract.createProposal(
        amountParsed,
        freelancerAccountAddress, // Lens Account address
        title,                     // On-chain title
        description,               // On-chain description
        dueDateTimestamp,          // On-chain due date (Unix timestamp)
        tokenAddress               // Payment token address
      ),
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
        address: freelancerAccountAddress,
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

// Updated to read on-chain data directly
const get_all_contracts = async (userLensAccountAddress: string) => {
  try {
    const cachedContracts = getCachedContracts(userLensAccountAddress);
    if (cachedContracts) {
      return cachedContracts;
    }

    const contract = getContractInstance();

    // Get proposal IDs and contract IDs for the user
    const [proposalIds, contractIds, defaultTokenAddress] = await Promise.all([
      contract.getUserProposalIds(userLensAccountAddress),
      contract.getUserContractIds(userLensAccountAddress),
      contract.token_address(),
    ]);

    const tokenDecimals = await getTokenDecimalsCached(defaultTokenAddress);

    const proposals = (
      await Promise.all(
        proposalIds.map(async (proposalId: any) => {
          try {
            const proposal = await contract.getProposal(proposalId);
            return {
              proposalId: Number(proposal.proposalId),
              title: proposal.title,
              description: proposal.description,
              clientAddress: proposal.clientAccount,
              freelancerAddress: proposal.freelancerAccount,
              paymentAmount: Number(ethers.formatUnits(proposal.amount, tokenDecimals)),
              dueDate: new Date(Number(proposal.dueDate) * 1000),
              state: proposal.isAccepted ? "inProgress" : proposal.isCancelled ? "cancelled" : "proposal",
              id: Number(proposal.proposalId),
              createdAt: new Date(Number(proposal.createdAt) * 1000),
            };
          } catch (error) {
            console.error("Error fetching proposal data:", error);
            return null;
          }
        })
      )
    ).filter(Boolean);

    const activeContracts = (
      await Promise.all(
        contractIds.map(async (contractId: any) => {
          try {
            const contractData = await contract.getContract(contractId);
            return {
              contractId: Number(contractData.contractId),
              title: contractData.title,
              description: contractData.description,
              clientAddress: contractData.clientAccount,
              freelancerAddress: contractData.freelancerAccount,
              paymentAmount: Number(ethers.formatUnits(contractData.amount, tokenDecimals)),
              dueDate: new Date(Number(contractData.dueDate) * 1000),
              state: contractState[Number(contractData.state)],
              id: Number(contractData.contractId),
              escrowId: Number(contractData.escrow_id),
              data: contractData.data,
              createdAt: new Date(Number(contractData.createdAt) * 1000),
            };
          } catch (error) {
            console.error("Error fetching contract data:", error);
            return null;
          }
        })
      )
    ).filter(Boolean);

    const contracts = [...proposals, ...activeContracts];
    setCachedContracts(userLensAccountAddress, contracts);
    return contracts;
  } catch (error) {
    console.error("Error in get_all_contracts:", error);
    return [];
  }
};

// Updated acceptProposal to match new signature
// acceptProposal(proposalId, InternalEscrowInput, amount)
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

  // Get default token address from ContractsManager and fetch decimals dynamically
  const defaultTokenAddress = await contract.token_address();
  const tokenDecimals = await getTokenDecimalsCached(defaultTokenAddress);
  const amountParsed = ethers.parseUnits(contractDetails.paymentAmount.toString(), tokenDecimals);
  
  // InternalEscrowInput structure:
  // { buyer: clientAccount, seller: freelancerAccount, challengePeriod, amount, paymentReference }
  const contractParams = {
    buyer: contractDetails.clientAddress,        // Lens Account address (client)
    seller: contractDetails.freelancerAddress,  // Lens Account address (freelancer)
    challengePeriod: 86400,                     // 1 day in seconds (dispute period)
    amount: amountParsed,
    paymentReference: "w3rk-contract",
  };

  // check date and show expired if outdated

  const result = await handleContractTransaction(
    () =>
      contract.acceptProposal(
        proposalId,
        contractParams,
        amountParsed
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
      text: "Cancelling Contract proposal",
    })
  );
  const contract = await getContract();

  const result = await handleContractTransaction(
    () => contract.cancelProposal(proposalId), // Updated function name
    dispatch
  );

  return result;
};

// Updated: updateContractData only updates the work notes (data field), not metadata
// Due dates are immutable - extension would require a new contract proposal
const request_extension = async (
  contractId: number,
  contractDetails: activeContractDetails,
  new_date: Date,
  dispatch: any
) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Updating Contract Notes",
    })
  );
  const contract = await getContract();

  // Note: Due dates are stored on-chain and are immutable in the current contract
  // To extend a contract, you would need to create a new proposal
  // This function now only updates the work notes/data field
  const extensionNote = `Extension requested: New due date ${new_date.toLocaleDateString()}`;

  const result = await handleContractTransaction(
    () => contract.updateContractData(contractId, extensionNote),
    dispatch
  );

  return result;
};

const request_payement = async (contractId: number, dispatch: any) => {
  dispatch(
    openLoader({
      displaytransactionLoader: true,
      text: "Requesting Payment",
    })
  );
  const contract = await getContract();

  const result = await handleContractTransaction(
    () => contract.requestPayment(contractId), // Updated function name
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
        text: "Releasing Payment",
      })
    );
    const contract = await getContract();

    // releasePayment handles Unicrow release internally
    const result = await handleContractTransaction(
      () => contract.releasePayment(contractId), // Updated function name
      dispatch
    );

    return result;
  } else {
    alert("Not an active contract");
  }
};

// Profile Creator functions removed - not needed for W3RK contract management
// Profile creation is handled through Lens Protocol SDK directly
// These functions required old contract ABIs that no longer exist

const get_score = async (address: string) => {
  try {
    const contract = getContractInstance();
    // Check if contract has score function (might not exist in all versions)
    if (typeof contract.score !== "function") {
      console.warn("Contract does not have score function, returning 0");
      return 0;
    }
    const score_raw = await contract.score(address);
    return Number(score_raw);
  } catch (error: any) {
    console.error("Error fetching score:", error);
    // Return 0 as fallback score instead of crashing
    return 0;
  }
};

/**
 * Get all accepted payment tokens from the contract
 * @returns Array of token addresses that are accepted for payments
 */
const getAcceptedTokens = async (): Promise<string[]> => {
  try {
    const contract = getContractInstance();
    if (typeof contract.getAllAcceptedTokens !== "function") {
      console.warn("Contract does not have getAllAcceptedTokens function");
      // Fallback to default token address
      const defaultToken = await contract.token_address();
      return defaultToken ? [defaultToken] : [];
    }
    const tokens = await contract.getAllAcceptedTokens();
    return tokens.map((addr: string) => addr.toLowerCase());
  } catch (error: any) {
    console.error("Error fetching accepted tokens:", error);
    // Fallback to default token address
    try {
      const contract = getContractInstance();
      const defaultToken = await contract.token_address();
      return defaultToken ? [defaultToken.toLowerCase()] : [];
    } catch {
      return [];
    }
  }
};

export {
  create_proposal,
  get_all_contracts,
  accept_proposal,
  getContractInstance,
  reject_proposal,
  cancle_proposal,
  request_extension,
  request_payement,
  release_payement,
  getContract,
  get_score,
  getAcceptedTokens,
};
