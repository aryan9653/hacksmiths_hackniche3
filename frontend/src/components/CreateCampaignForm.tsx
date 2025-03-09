"use client";

import { useState } from "react";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { CloudUpload, ArrowLeft, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCampaignForm() {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter to allow only images and videos
  const filterFiles = (files: File[]) =>
    files.filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/")
    );

  // Handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = filterFiles(Array.from(e.target.files));
      setFiles(validFiles);
    }
  };

  // Handle drag-and-drop file uploads
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const validFiles = filterFiles(Array.from(e.dataTransfer.files));
      setFiles(validFiles);
    }
  };

  // Upload files to Pinata and return IPFS hashes
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

  // Handle campaign creation submission
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

  // Remove all selected files
  const clearFiles = () => setFiles([]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>
      <div className="w-[1200px] p-10 bg-black shadow-2xl rounded-xl border border-white">
        <h1 className="text-4xl font-bold mb-8 text-center">Create Campaign</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Form Fields */}
          <div className="flex-1 flex flex-col space-y-6">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="w-full p-4 h-16 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              name="goal"
              placeholder="Goal (in ETH)"
              className="w-full p-4 h-16 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <input
              type="text"
              name="duration"
              placeholder="Duration (in days)"
              className="w-full p-4 h-16 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full p-4 h-40 bg-black border border-white rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          {/* Right Side: File Upload */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-full min-h-[426px] p-8 border-2 border-dashed border-white rounded-lg bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-gray-900 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*, video/*"
                className="hidden"
                id="fileUpload"
                onChange={handleFileChange}
              />
              <label htmlFor="fileUpload" className="text-center text-gray-400">
                <CloudUpload className="w-12 h-12 mx-auto mb-4 text-white" />
                Drag & drop files here or{" "}
                <span className="text-white underline">click to upload</span>
              </label>
            </div>
            {/* File Previews (fixed height so component size remains constant) */}
            <div className="mt-4 w-full h-48 overflow-y-auto">
              {files.length > 0 ? (
                <>
                  <h2 className="text-xl font-semibold mb-2">Selected Files:</h2>
                  <div className="flex flex-wrap gap-4">
                    {files.map((file, index) => {
                      const isImage = file.type.startsWith("image/");
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center bg-black p-2 rounded-lg border border-white"
                        >
                          {isImage ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-24 h-24 object-cover rounded"
                            />
                          ) : (
                            <div className="w-24 h-24 flex flex-col items-center justify-center">
                              <Video className="w-8 h-8 text-white" />
                              <p className="text-sm text-center text-white">{file.name}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={clearFiles}
                    className="mt-2 px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Clear Files
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white text-xl font-medium">
                  No files selected
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end mt-8 gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-4 bg-white text-black hover:bg-gray-300 rounded-lg font-semibold transition transform hover:scale-105"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
