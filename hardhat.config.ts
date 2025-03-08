import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    mumbai: {
      url: process.env.MUMBAI_API_URL as string,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
