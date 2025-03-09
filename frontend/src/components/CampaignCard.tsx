"use client";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Slide, ToastContainer, toast } from "react-toastify";

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
  const [mediaHash, setMediaHash] = useState();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const contract = await getContract();
        const { mediaHashes } = await contract.getCampaign(Number(campaignId));
        console.log(mediaHashes);
        setMediaHash(mediaHashes);
      } catch (error) {
        console.error("Error fetching images from Pinata:", error);
      }
    };

    fetchImages();
  }, []);

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
      // alert("Please enter a valid contribution amount greater than 0.");
      toast.error("Please enter a valid contribution amount greater than 0.", {
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
      return;
    }
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.contribute(campaignId, {
        value: ethers.parseEther(contribution),
      });
      await tx.wait();
      // alert("Contribution successful!");
      toast.success("Contribution Successfully", {
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
      setContribution("");
    } catch (error) {
      console.error("Error contributing:", error);
      // alert("Failed to contribute");
      toast.error("Failed to contribute", {
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
      className="w-full max-w-sm bg-black border border-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <img
          src={`https://picsum.photos/seed/picsum/200/300`}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4 bg-black">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2 bg-black text-white">
        <p className="text-sm">{description}</p>
        <p className="text-sm">
          Creator: {creator.slice(0, 6)}...{creator.slice(-4)}
        </p>
        <p className="text-sm">Goal: {ethers.formatEther(BigInt(goal))} ETH</p>
        <p className="text-sm">
          Raised: {ethers.formatEther(BigInt(totalFunds))} ETH
        </p>
        <p className="text-sm">
          Deadline: {new Date(deadline * 1000).toLocaleString()}
        </p>
        <p className="text-sm font-medium">Status: {statusText}</p>
        <div className="w-full bg-black border border-white rounded-full h-2.5 mt-2">
          <div
            className="bg-white h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-center">{progress.toFixed(2)}% Funded</p>
      </CardContent>
      <CardFooter className="p-4 bg-black">
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
                placeholder="Enter ETH amount"
                className="flex-1 p-2 bg-black text-white border border-white rounded-lg focus:ring-2 focus:ring-white"
                required
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-white text-black px-4 py-2 rounded-lg hover:ring-2 hover:ring-white disabled:opacity-50 transition-all"
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
