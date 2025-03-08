import { ethers } from "hardhat";

async function main(): Promise<void> {
  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();
  await crowdfunding.deploymentTransaction()?.wait();
  const address = await crowdfunding.getAddress();
  console.log("Crowdfunding deployed to:", address);
}

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
