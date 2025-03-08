const { ethers } = require("hardhat");

async function fastForwardTime(seconds: number) {
  console.log(`Fast-forwarding time by ${seconds} seconds...`);
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
  console.log("Time fast-forwarded successfully!");
}

fastForwardTime(60) // 1 day
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
