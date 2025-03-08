"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dock } from "@/components/magicui/dock";
import { motion } from "framer-motion";
import { DockDemo } from "./components/dock";

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<
    { id: number; title: string; amount: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        const data = [
          { id: 1, title: "Decentralized Education Fund", amount: "5.2 ETH" },
          {
            id: 2,
            title: "Medical Aid via Smart Contracts",
            amount: "8.1 ETH",
          },
          {
            id: 3,
            title: "Medical Aid via Smart Contracts",
            amount: "8.1 ETH",
          },
        ];
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <div className=" flex flex-row text-center py-24 bg-gradient-to-b from-black via-gray-900 to-gray-800 min-h-[60vh]">
        <div className="w-1/2 flex flex-col items-center justify-center text-center px-8">
        <motion.h1
          className="text-4xl md:text-6xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Empowering Ideas through Blockchain
        </motion.h1>
        <p className="mt-4 text-lg text-gray-300">
          Launch, Fund, and Track Campaigns Securely
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/start-campaign">
            <Button className="px-6 py-3 bg-blue-500 hover:bg-blue-600">
              Start a Campaign
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant="outline"
              className="px-6 py-3 border-gray-400 text-black"
            >
              Explore Campaigns
            </Button>
          </Link>
        </div>
        
        </div>
        <div className="w-1/2 flex flex-col items-center justify-center px-8">
      <motion.img
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        src="img.png"
        alt="Blockchain Illustration"
        className="mt-4 w-[500px] h-[500px] object-contain"
      />
    </div>
      </div>

      <div className="py-12 px-6">
        <h2 className="text-3xl font-bold">Trending Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {loading ? (
            <p className="text-gray-400">Loading campaigns...</p>
          ) : campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 border border-gray-700 rounded-lg bg-gray-800"
              >
                <h3 className="text-xl font-semibold">{campaign.title}</h3>
                <p className="text-gray-400">Raised: {campaign.amount}</p>
                <Link href={`/campaign/${campaign.id}`}>
                  <Button className="mt-3 w-full">View Details</Button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No active campaigns yet.</p>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex justify-center w-auto mb-8">
        <DockDemo />
      </div>
    </div>
  );
}
