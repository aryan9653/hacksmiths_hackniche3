# Hardhat Smart Contract Project

This project demonstrates a basic Hardhat use case. It includes a sample Solidity smart contract, unit tests, and a Hardhat Ignition module for deployment.

## 📌 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Hardhat](https://hardhat.org/)
- [Git](https://git-scm.com/)
- A [MetaMask](https://metamask.io/) wallet for interacting with deployed contracts

## 🚀 Getting Started

### 1️⃣ Clone the Repository
To clone this repository, run:
```sh
 git clone https://github.com/your-username/your-repo-name.git
 cd your-repo-name
```

### 2️⃣ Fork the Repository
To fork the repository:
1. Go to the [GitHub Repository](https://github.com/your-username/your-repo-name)
2. Click the `Fork` button (top right corner)
3. Clone your forked repository:
   ```sh
   git clone https://github.com/your-username/your-forked-repo.git
   cd your-forked-repo
   ```

### 3️⃣ Install Dependencies
Run the following command to install required dependencies:
```sh
npm install
```

### 4️⃣ Configure Environment Variables
Create a `.env` file in the root directory and add the required credentials:
```env
PRIVATE_KEY=your_wallet_private_key
INFURA_API_KEY=your_infura_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
```

## 🔧 Available Scripts

### 📌 Compile the Smart Contract
```sh
npx hardhat compile
```

### 🧪 Run Tests
```sh
npx hardhat test
```
To run tests with gas reporting:
```sh
REPORT_GAS=true npx hardhat test
```

### 🚀 Start a Local Hardhat Node
```sh
npx hardhat node
```

### 📤 Deploy the Smart Contract
To deploy using Hardhat Ignition:
```sh
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
To deploy on a specific network:
```sh
npx hardhat run scripts/deploy.js --network rinkeby
```

## 🎭 Interacting with the Smart Contract
After deploying the contract, you can interact using Hardhat Console:
```sh
npx hardhat console --network localhost
```
Then run:
```js
const contract = await ethers.getContractAt("ContractName", "DEPLOYED_CONTRACT_ADDRESS");
await contract.someFunction();
```

## 🔄 Pushing Changes to GitHub
If you made any changes and want to push them to GitHub:
```sh
git add .
git commit -m "Your commit message"
git push origin main
```

## 🤝 Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



