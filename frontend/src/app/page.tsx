"use client";
import React, { useState, useEffect } from "react";
import { User, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import CampaignList from "@/components/CampaignList";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/contract";
import { Slide, toast } from "react-toastify";

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();

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
      // alert("Failed to connect wallet");
      toast.error("Failed to connect wallet", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight cursor-pointer">
          CrowdFundX
        </h1>
        <div className="flex items-center space-x-4">
          {!walletAddress ? (
            <Button
              onClick={handleConnectWallet}
              className="bg-white text-black hover:bg-gray-200 transition-colors"
            >
              Connect Wallet
            </Button>
          ) : (
            <span className="text-sm">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          )}
          <div className="border border-white p-2 rounded-full hover:bg-white hover:text-black transition-colors cursor-pointer">
            <User size={24} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold"></h2>
          <Button
            onClick={() => router.push("/create")}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 transition-colors"
          >
            <PlusCircle size={20} /> Add New Campaign
          </Button>
        </div>
        <CampaignList />
      </main>
    </div>
  );
};

export default App;
