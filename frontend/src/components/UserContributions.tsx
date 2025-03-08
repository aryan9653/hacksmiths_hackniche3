"use client";
import { connectWallet, getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

interface Contribution {
  campaignId: number;
  totalAmount: string;
}

const UserContributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const contract = await getContract();
      const campaignCount = Number(await contract.campaignCount());
      const address =
        localStorage.getItem("walletAddress") || (await connectWallet());
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);
      const contributionsData: Contribution[] = [];

      for (let i = 0; i < campaignCount; i++) {
        const contribution = await contract.getContribution(i, address);
        if (contribution > 0n) {
          const existing = contributionsData.find((c) => c.campaignId === i);
          if (existing) {
            existing.totalAmount = ethers.formatEther(
              BigInt(existing.totalAmount) + BigInt(contribution)
            );
          } else {
            contributionsData.push({
              campaignId: i,
              totalAmount: ethers.formatEther(contribution),
            });
          }
        }
      }
      setContributions(contributionsData);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const setupEventListeners = async () => {
      const contract = await getContract();
      contract.on("Contributed", (campaignId, contributor, amount) => {
        if (contributor.toLowerCase() === walletAddress?.toLowerCase()) {
          fetchData();
        }
      });
      contract.on("Refunded", (campaignId, contributor, amount) => {
        if (contributor.toLowerCase() === walletAddress?.toLowerCase()) {
          fetchData();
        }
      });
    };

    setupEventListeners();

    const pollingInterval = setInterval(fetchData, 5000);

    return () => clearInterval(pollingInterval);
  }, [walletAddress]);

  if (loading)
    return (
      <p className="text-center text-gray-600">Loading contributions...</p>
    );

  return (
    <Card className="w-full max-w-md mx-auto border rounded-lg shadow-md hover:shadow-lg transition-shadow mt-4">
      <CardHeader className="p-4 bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800">
          Your Contributions
        </h2>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {contributions.length > 0 ? (
          <ul className="space-y-2">
            {contributions.map((contrib) => (
              <li
                key={contrib.campaignId}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-sm text-gray-700">
                  Campaign {contrib.campaignId}: {contrib.totalAmount} ETH
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">No contributions found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserContributions;
