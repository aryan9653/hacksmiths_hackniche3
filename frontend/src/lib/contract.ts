import { ethers } from "ethers";
import CrowdfundingABI from "/home/harsh/Hackniche/hacksmiths_hackniche3/artifacts/contracts/Crowdfunding.sol/Crowdfunding.json";
import EscrowABI from "/home/harsh/Hackniche/hacksmiths_hackniche3/artifacts/contracts/Crowdfunding.sol/Escrow.json";

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

export const getContract = async () => {
  if (!window.ethereum) throw new Error("Please install MetaMask");
  const provider = new ethers.BrowserProvider(window.ethereum);
  try {
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(31337)) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }], // Chain ID 31337 in hex
      });
    }
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, CrowdfundingABI.abi, signer);
  } catch (error) {
    console.error("Error connecting to network:", error);
    throw new Error("Failed to connect to Hardhat network");
  }
};

// Added function to get Escrow contract instance
export const getEscrowContract = async (escrowAddress: string) => {
  if (!window.ethereum) throw new Error("Please install MetaMask");
  const provider = new ethers.BrowserProvider(window.ethereum);
  try {
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return new ethers.Contract(escrowAddress, EscrowABI.abi, signer);
  } catch (error) {
    console.error("Error connecting to escrow contract:", error);
    throw new Error("Failed to connect to escrow contract");
  }
};

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  localStorage.setItem("walletAddress", address);
  return address;
};

export const getSigner = async () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
};

export const getContributors = async (campaignId: number) => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const contract = await getContract();
  const contributors = await contract.getContributors(campaignId);
  return contributors;
};
