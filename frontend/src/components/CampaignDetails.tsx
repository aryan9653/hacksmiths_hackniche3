"use client";

import { connectWallet, getContract, getEscrowContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
} from "@/components/ui/extension/carousel";

type Campaign = {
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
};

export default function VideoDonationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
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
          const contribution = await contract.getContribution(Number(id), contributor);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        Loading campaign details...
      </div>
    );
  }
  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        Campaign not found.
      </div>
    );
  }

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

  // Dynamic carousel using campaign media
  const DynamicCarousel = () => {
    if (campaign.mediaHashes.length === 0) {
      return (
        <div className="flex items-center justify-center h-[500px] bg-gray-700 rounded-md">
          <p className="">No media available</p>
        </div>
      );
    }
    return (
      <Carousel orientation="horizontal" className="flex flex-col items-center gap-2">
        <CarouselMainContainer className="h-[500px] w-[1000px] bg-black">
          {campaign.mediaHashes.map((hash, index) => {
            const mediaUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
            return (
              <SliderMainItem
                key={index}
                className="border border-muted flex items-center justify-center h-[500px] rounded-md"
              >
                <Media url={mediaUrl} />
              </SliderMainItem>
            );
          })}
        </CarouselMainContainer>
        <CarouselThumbsContainer className="basis-1/4">
          {campaign.mediaHashes.map((hash, index) => {
            const mediaUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
            return (
              <SliderThumbItem
                key={index}
                index={index}
                className="rounded-md bg-transparent h-[200px]"
              >
                <Media url={mediaUrl} />
              </SliderThumbItem>
            );
          })}
        </CarouselThumbsContainer>
      </Carousel>
    );
  };

  // Media component: try rendering as an image first, then fall back to video if loading fails
  const Media: React.FC<{ url: string }> = ({ url }) => {
    const [isVideo, setIsVideo] = useState(false);

    if (isVideo) {
      return (
        <video
          controls
          className="w-full h-full rounded-md"
          preload="metadata"
        >
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        src={url}
        alt="Campaign media"
        className="w-full h-full object-cover rounded-md"
        loading="lazy"
        onError={() => setIsVideo(true)}
      />
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-black bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/your-background-image.jpg')" }}
    >
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>
      <div className="p-8 w-full bg-white bg-opacity-10 backdrop-blur-md shadow-xl rounded-lg flex">
        {/* Left Section: Media Carousel */}
        <div className="w-2/3 pr-6">
          <DynamicCarousel />
        </div>
        {/* Right Section: Campaign Details */}
        <div className="w-1/3 pl-6 flex flex-col p-5">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">
            {campaign.title}
          </h1>
          <p className="text-lg text-gray-300 mb-4 break-words">{campaign.description}</p>
          <div className="flex justify-between text-gray-300 text-lg mb-6">
            <p>
              <strong>Target:</strong>{" "}
              {ethers.formatEther(BigInt(campaign.goal))} ETH
            </p>
            <p>
              <strong>Raised:</strong>{" "}
              {ethers.formatEther(BigInt(campaign.totalFunds))} ETH
            </p>
          </div>
          <p className=" mb-2 text-gray-300">
            <strong>Deadline:</strong>{" "}
            {new Date(campaign.deadline * 1000).toLocaleString()}
          </p>
          <p className=" mb-2 text-gray-300">
            <strong>Status:</strong> {statusText}
          </p>
          <p className=" mb-2 text-gray-300">
            <strong>Escrow:</strong> {campaign.escrow.slice(0, 6)}...
            {campaign.escrow.slice(-4)}
          </p>
          <p className=" mb-4 text-gray-300">
            <strong>Escrow Balance:</strong> {escrowBalance} ETH
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {campaign.status === 0 && (
            <form onSubmit={contribute} className="w-full mb-4">
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="Enter amount in ETH"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={contributeDisabled}
                  className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {contributeLoading ? "Contributing..." : "Contribute"}
                </button>
              </div>
            </form>
          )}
          {canRelease && (
            <button
              onClick={releaseFunds}
              disabled={releaseDisabled}
              className="w-full bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors mb-4"
            >
              {releaseLoading ? "Releasing..." : "Release Funds"}
            </button>
          )}
          {canRefund && (
            <button
              onClick={refund}
              disabled={refundDisabled}
              className="w-full bg-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors mb-4"
            >
              {refundLoading ? "Refunding..." : "Request Refund"}
            </button>
          )}
          <h2 className="text-xl font-semibold text-gray-300 mt-4">Contributors:</h2>
          <ul className="mt-2 space-y-2 overflow-y-auto max-h-48">
            {contributors.length > 0 ? (
              contributors.map((contributor: string, index: number) => (
                <li
                  key={index}
                  className="p-3 bg-white bg-opacity-20 rounded-lg border border-gray-200"
                >
                  <p className="text-sm">
                    {contributor}:{" "}
                    {ethers.formatEther(BigInt(contributions[index] || "0"))} ETH
                    {refunded[index] && " (Refunded)"}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-300">No contributors yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
