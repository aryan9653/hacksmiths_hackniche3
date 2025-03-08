"use client";
import { connectWallet, getContract, getEscrowContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

const CampaignDetails: React.FC = () => {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<{
    creator: string;
    title: string;
    description: string;
    goal: string;
    deadline: number;
    totalFunds: string;
    status: number;
    fundsReleased: boolean;
    mediaHashes: string[];
    escrow: string;
  } | null>(null);
  const [escrowBalance, setEscrowBalance] = useState<string>("0");
  const [contributors, setContributors] = useState<string[]>([]);
  const [contributions, setContributions] = useState<string[]>([]);
  const [refunded, setRefunded] = useState<boolean[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contribution, setContribution] = useState<string>("");
  const [contributeLoading, setContributeLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);

  const fetchData = async () => {
    try {
      const contract = await getContract();
      const [
        creator,
        title,
        description,
        goal,
        deadline,
        totalFunds,
        status,
        fundsReleased,
        mediaHashes,
        escrow,
      ] = await contract.getCampaign(Number(id));
      const fetchedContributors = await contract.getContributors(Number(id));
      const fetchedContributions = await Promise.all(
        fetchedContributors.map(async (contributor: string) => {
          const contribution = await contract.getContribution(
            Number(id),
            contributor
          );
          return contribution.toString();
        })
      );
      const fetchedRefunded = await Promise.all(
        fetchedContributors.map(async (contributor: string) => {
          return await contract.isRefunded(Number(id), contributor);
        })
      );

      const escrowContract = await getEscrowContract(escrow);
      const balance = await escrowContract.getBalance();
      setEscrowBalance(ethers.formatEther(balance));

      setCampaign({
        creator,
        title,
        description,
        goal: goal.toString(),
        deadline: Number(deadline),
        totalFunds: totalFunds.toString(),
        status: Number(status),
        fundsReleased,
        mediaHashes,
        escrow,
      });
      setContributors(fetchedContributors);
      setContributions(fetchedContributions);
      setRefunded(fetchedRefunded);

      const storedAddress = localStorage.getItem("walletAddress");
      if (storedAddress) {
        setWalletAddress(storedAddress);
      } else {
        const address = await connectWallet();
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);
      }
    } catch (error) {
      console.error("Error fetching campaign details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const setupEventListeners = async () => {
      const contract = await getContract();
      contract.on("CampaignStatusUpdated", (campaignId, newStatus) => {
        if (Number(campaignId) === Number(id)) fetchData();
      });
      contract.on("Refunded", (campaignId, contributor, amount) => {
        if (Number(campaignId) === Number(id)) fetchData();
      });
      contract.on("Contributed", (campaignId, contributor, amount) => {
        if (Number(campaignId) === Number(id)) fetchData();
      });
      contract.on("FundsReleased", (campaignId, creator, amount) => {
        if (Number(campaignId) === Number(id)) fetchData();
      });
    };

    setupEventListeners();

    const pollingInterval = setInterval(fetchData, 5000);

    return () => clearInterval(pollingInterval);
  }, [id]);

  const contribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribution || Number(contribution) <= 0) {
      alert("Please enter a valid contribution amount greater than 0.");
      return;
    }
    setContributeLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.contribute(Number(id), {
        value: ethers.parseEther(contribution),
      });
      await tx.wait();
      alert("Contribution successful!");
      setContribution("");
      await fetchData();
    } catch (error) {
      console.error("Error contributing:", error);
      alert("Failed to contribute");
    } finally {
      setContributeLoading(false);
    }
  };

  const refund = async () => {
    setRefundLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.refund(Number(id), { gasLimit: 1000000 });
      await tx.wait();
      alert("Refund requested successfully!");
      await fetchData();
    } catch (error: any) {
      console.error("Error refunding:", error);
      alert("Failed to refund: " + (error.reason || error.message));
    } finally {
      setRefundLoading(false);
    }
  };

  const releaseFunds = async () => {
    setReleaseLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.releaseFunds(Number(id), { gasLimit: 1000000 });
      await tx.wait();
      alert("Funds released successfully!");
      await fetchData();
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      alert("Failed to release funds: " + (error.reason || error.message));
    } finally {
      setReleaseLoading(false);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600">Loading campaign details...</p>
    );
  if (!campaign)
    return <p className="text-center text-gray-600">Campaign not found.</p>;

  const progress = Math.min(
    (Number(campaign.totalFunds) / Number(campaign.goal)) * 100,
    100
  );
  const statusText =
    campaign.status === 0
      ? "Active"
      : campaign.status === 1
      ? "Completed"
      : campaign.status === 2
      ? "Failed"
      : "Refunded";
  const canRelease =
    campaign.status === 1 &&
    !campaign.fundsReleased &&
    walletAddress?.toLowerCase() === campaign.creator.toLowerCase();
  const canRefund =
    campaign.status === 2 && contributions.some((c) => BigInt(c) > 0);
  const isContributor = walletAddress && contributors.includes(walletAddress);

  const contributeDisabled = contributeLoading || campaign?.status !== 0;
  const releaseDisabled = releaseLoading || !canRelease;
  const refundDisabled =
    refundLoading ||
    !canRefund ||
    (isContributor &&
    refunded[contributors.indexOf(walletAddress)] !== undefined
      ? refunded[contributors.indexOf(walletAddress)]
      : false);

  return (
    <Card className="w-full max-w-4xl mx-auto border rounded-lg shadow-md hover:shadow-lg transition-shadow mt-4">
      <CardHeader className="p-4 bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-800">
          {campaign.title}
        </h1>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left Side: Media */}
          <div className="w-full md:w-1/2">
            {campaign.mediaHashes.length > 0 ? (
              campaign.mediaHashes.map((hash, index) => {
                // Use your Pinata gateway or any other preferred gateway
                const mediaUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
                return <Media key={index} url={mediaUrl} />;
              })
            ) : (
              <p className="text-gray-600">No media available</p>
            )}
          </div>

          {/* Right Side: Details */}
          <div className="w-full md:w-1/2 space-y-4">
            <p>
              <strong>Creator:</strong> {campaign.creator.slice(0, 6)}...
              {campaign.creator.slice(-4)}
            </p>
            <p>{campaign.description}</p>
            <p>
              <strong>Goal:</strong> {ethers.formatEther(BigInt(campaign.goal))}{" "}
              ETH
            </p>
            <p>
              <strong>Raised:</strong>{" "}
              {ethers.formatEther(BigInt(campaign.totalFunds))} ETH
            </p>
            <p>
              <strong>Deadline:</strong>{" "}
              {new Date(campaign.deadline * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {statusText}
            </p>
            <p>
              <strong>Escrow:</strong> {campaign.escrow.slice(0, 6)}...
              {campaign.escrow.slice(-4)}
            </p>
            <p>
              <strong>Escrow Balance:</strong> {escrowBalance} ETH
            </p>
            <p>
              <strong>Funds Released:</strong>{" "}
              {campaign.fundsReleased ? "Yes" : "No"}
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
            {campaign.status === 0 && (
              <form onSubmit={contribute} className="w-full">
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    placeholder="Enter amount in ETH"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={contributeDisabled}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {contributeLoading ? "Contributing..." : "Contribute"}
                  </Button>
                </div>
              </form>
            )}
            {canRelease && (
              <Button
                onClick={releaseFunds}
                disabled={releaseDisabled}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {releaseLoading ? "Releasing..." : "Release Funds"}
              </Button>
            )}
            {canRefund && (
              <Button
                onClick={refund}
                disabled={refundDisabled}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
              >
                {refundLoading ? "Refunding..." : "Request Refund"}
              </Button>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-4">Contributors:</h2>
        <ul className="mt-2 space-y-2">
          {contributors.length > 0 ? (
            contributors.map((contributor: string, index: number) => (
              <li
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-sm text-gray-700">
                  {contributor}:{" "}
                  {ethers.formatEther(BigInt(contributions[index] || "0"))} ETH
                  {refunded[index] && " (Refunded)"}
                </p>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-600">No contributors yet.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};
interface MediaProps {
  url: string;
}

const Media: React.FC<MediaProps> = ({ url }) => {
  const [isVideo, setIsVideo] = useState(false);

  // If isVideo is true, render a video player.
  if (isVideo) {
    return (
      <video
        controls
        autoPlay
        className="w-full h-auto mb-2 rounded-lg"
        preload="metadata"
        poster="https://placehold.co/400x300" // Optional poster image
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Otherwise, try to render an image.
  return (
    <img
      src={url}
      alt="Campaign media"
      className="w-full h-auto mb-2 rounded-lg"
      loading="lazy"
      onError={() => setIsVideo(true)}
    />
  );
};

export default CampaignDetails;
