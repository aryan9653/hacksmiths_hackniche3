"use client";

import { useState } from "react";
import axios from "axios";
import { CloudUpload } from "lucide-react";

export default function CreateCampaign() {
  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    duration: "",
    description: "",
    files: [] as File[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filterFiles = (files: File[]) =>
    files.filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/")
    );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = filterFiles(Array.from(e.target.files));
      setFormData({ ...formData, files: validFiles });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const validFiles = filterFiles(Array.from(e.dataTransfer.files));
      setFormData({ ...formData, files: validFiles });
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("goal", formData.goal);
    data.append("duration", formData.duration);
    data.append("description", formData.description);
    formData.files.forEach((file) => data.append("files", file));

    try {
      const response = await axios.post("/api/campaign", data);
      console.log("Success:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="w-[1200px] p-10 bg-gray-950 shadow-2xl rounded-xl border border-gray-800">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Create Campaign</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col space-y-6">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="w-full p-4 h-16 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.title}
              onChange={handleChange}
            />
            <input
              type="text"
              name="goal"
              placeholder="Goal"
              className="w-full p-4 h-16 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.goal}
              onChange={handleChange}
            />
            <input
              type="text"
              name="duration"
              placeholder="Duration"
              className="w-full p-4 h-16 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.duration}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full p-4 h-40 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-full min-h-[426px] p-8 border-2 border-dashed border-indigo-500 rounded-lg bg-gray-900 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition"
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
                <CloudUpload className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                Drag & drop files here or {" "}
                <span className="text-indigo-400 underline">click to upload</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            className="px-8 py-4 bg-purple-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition transform hover:scale-105"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
