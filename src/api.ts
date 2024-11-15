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

const rpc_url = `https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`;
let provider = new ethers.JsonRpcProvider(rpc_url);

unicrow.config({
  defaultNetwork: unicrow.DefaultNetwork.ArbitrumSepolia,
  // autoSwitchNetwork: true,
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

  const currentChainId = await provider
    .getNetwork()
    .then((network) => network.chainId);

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

  const currentChainId = await provider
    .getNetwork()
    .then((network) => network.chainId);

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
      console.log("In part 1");
      const approvalTx = await contract.approve(
        approvalAddress,
        ethers.parseEther(amount.toString())
      );
      console.log("in part 2");

      await approvalTx.wait();
      console.log("in part 3");
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
    const tx = await txFunction();
    await tx.wait();
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
  dispatch: any
) => {
  const contract = await getContract();

  const tokensApproved = await handleTokenApproval(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    Number(amount),
    dispatch
  );
  console.log("Approved: ", tokensApproved);
  console.log("Got here");

  if (tokensApproved) {
    console.log("Got here 2");
    dispatch(
      openLoader({
        displaytransactionLoader: true,
        text: "Creating Cotract proposal",
      })
    );
    console.log("Got here 3");
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
  const contract = contractInstance;
  const proposals = await contract.get_proposals(user);
  const contracts_data = await contract.get_contracts(user);

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
  console.log("Got here 1");
  const escrowData = await uploadJsonToIPFS(newContract);
  console.log("Git here 2");

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
const create_new_profile = async (
  handle: string,
  address: string,
  dispatch: any
) => {
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

const create_profile = async (
  handle: string,
  address: string,
  dispatch: any
) => {
  const contract = await getPermissionContract();

  console.log("Handle: ", handle);

  const createProfileParams = {
    to: address,
    followModule: "0x0000000000000000000000000000000000000000",
    followModuleInitData: "0x",
  };

  console.log("Params", createProfileParams);

  const tx = await contract.createProfileWithHandle(
    createProfileParams,
    handle,
    ["0x71990499e005Db4d7854eea564023AB64ca884b5"]
  );
  await tx.wait();
  console.log("Result: ", tx);
  return "Success!";
};

const get_score = async (address: string) => {
  const contract = contractInstance;

  const score_raw = await contract.score(address);
  console.log("Score: ", score_raw);
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
