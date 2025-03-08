"use client";
import CampaignList from "@/components/CampaignList";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/contract";
import { useEffect, useState } from "react";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      const storedAddress = localStorage.getItem("walletAddress");
      if (storedAddress) {
        setWalletAddress(storedAddress);
      } else {
        try {
          const address = await connectWallet();
          setWalletAddress(address);
          localStorage.setItem("walletAddress", address);
        } catch (error) {
          console.error("Error connecting wallet:", error);
        }
      }
    };
    fetchWallet();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Crowdfunding Campaigns
        </h1>
        {!walletAddress ? (
          <Button
            onClick={handleConnectWallet}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Connect Wallet
          </Button>
        ) : (
          <p className="text-sm text-gray-600">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        )}
      </div>
      <CampaignList />
    </div>
  );
}
