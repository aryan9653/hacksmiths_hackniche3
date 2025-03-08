"use client";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

interface CampaignProps {
  campaignId: number;
  title: string;
  description: string;
  creator: string;
  goal: string;
  deadline: number;
  totalFunds: string;
  status: number;
}

const CampaignCard: React.FC<CampaignProps> = ({
  campaignId,
  title,
  description,
  creator,
  goal,
  deadline,
  totalFunds,
  status,
}) => {
  const router = useRouter();
  const [contribution, setContribution] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const isInteractive =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLButtonElement;
    if (!isInteractive) {
      router.push(`/campaign/${campaignId}`);
    }
  };

  const contribute = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!contribution || Number(contribution) <= 0) {
      alert("Please enter a valid contribution amount greater than 0.");
      return;
    }
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.contribute(campaignId, {
        value: ethers.parseEther(contribution),
      });
      await tx.wait();
      alert("Contribution successful!");
      setContribution("");
    } catch (error) {
      console.error("Error contributing:", error);
      alert("Failed to contribute");
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min((Number(totalFunds) / Number(goal)) * 100, 100);
  const statusText =
    status === 0
      ? "Active"
      : status === 1
      ? "Completed"
      : status === 2
      ? "Failed"
      : "Refunded";

  return (
    <Card
      className="w-full max-w-sm border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="p-4 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-sm text-gray-600">
          Creator: {creator.slice(0, 6)}...{creator.slice(-4)}
        </p>
        <p className="text-sm text-gray-600">
          Goal: {ethers.formatEther(BigInt(goal))} ETH
        </p>
        <p className="text-sm text-gray-600">
          Raised: {ethers.formatEther(BigInt(totalFunds))} ETH
        </p>
        <p className="text-sm text-gray-600">
          Deadline: {new Date(deadline * 1000).toLocaleString()}
        </p>
        <p className="text-sm font-medium text-gray-800">
          Status: {statusText}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          {progress.toFixed(2)}% Funded
        </p>
      </CardContent>
      <CardFooter className="p-4">
        {status === 0 && (
          <form
            onSubmit={contribute}
            onClick={(e) => e.stopPropagation()}
            className="w-full"
          >
            <div className="flex space-x-2">
              <Input
                type="number"
                step="0.1"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                placeholder="Enter amount in ETH"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {loading ? "Contributing..." : "Contribute"}
              </Button>
            </div>
          </form>
        )}
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
