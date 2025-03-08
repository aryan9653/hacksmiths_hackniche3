import dotenv from 'dotenv';

dotenv.config();

async function getFileUrl(cid: string) {
  return `https://dweb.link/ipfs/${cid}`;
}

// Example usage
const cid = 'YOUR_CID_HERE';
console.log(`🔗 Fetch NFT from: ${getFileUrl(cid)}`);
