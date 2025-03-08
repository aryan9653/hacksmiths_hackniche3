"use client";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";

const CreateCampaignForm: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const uploadFilesToPinata = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/uploadToPinata", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files to Pinata");
      }

      const data = await response.json();
      return data.ipfsHashes;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || Number(goal) <= 0 || Number(duration) <= 0) {
      alert("Please fill in all fields correctly.");
      return;
    }
    setLoading(true);
    try {
      // Upload files to Pinata and get IPFS hashes
      const mediaHashes = await uploadFilesToPinata(files);

      // Convert duration from days to seconds
      const durationInSeconds = Number(duration) * 24 * 60 * 60;
      // For testing: Uncomment below line for a short duration
      // const durationInSeconds = 60;

      const contract = await getContract();
      const tx = await contract.createCampaign(
        title,
        description,
        ethers.parseEther(goal),
        durationInSeconds,
        mediaHashes
      );
      await tx.wait();
      alert("Campaign created successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setGoal("");
      setDuration("");
      setFiles([]);
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border rounded-lg shadow-md hover:shadow-lg transition-shadow mt-4">
      <CardHeader className="p-4 bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-800">
          Create a Campaign
        </h1>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Goal (in ETH)
          </label>
          <Input
            type="number"
            step="0.1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Duration (in days)
          </label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Media Files
          </label>
          <Input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full p-2"
          />
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Creating..." : "Create Campaign"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateCampaignForm;
