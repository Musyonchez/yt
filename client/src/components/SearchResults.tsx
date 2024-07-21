import React, { useEffect, useState } from "react";
import Image from "next/image";
import formatDuration from "../utils/formatDuration";
import axios from "axios";
import WaveLoader from "@/utils/WaveLoader";
import CircleLoader from "@/utils/CircleLoader";
import logo from "../../public/images/black-logo.png";

interface VideoInfo {
  originalUrl: string;
  title: string;
  channel: string;
  duration: number; // Duration in seconds
  thumbnail: string;
}

const SearchResults = ({ response }: { response: { type: string, videos: VideoInfo[] } }) => {
  const [downloadInProgress, setDownloadInProgress] = useState(false);




  const handleDownload = async (searchInput: string) => {
    try {
      setDownloadInProgress(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/url/audio",
        {
          url: searchInput,
        },
        {
          responseType: "arraybuffer", // Ensure the response is in binary format
        }
      );

      // Convert the response data (arraybuffer) to a Blob
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      // Create a link element
      const link = document.createElement("a");
      // Create a URL for the Blob and set it as the href attribute
      link.href = window.URL.createObjectURL(blob);
      // Set the download attribute with a filename
      link.download = "downloaded_audio.mp3";
      // Append the link to the body
      document.body.appendChild(link);
      // Programmatically click the link to trigger the download
      link.click();
      // Remove the link from the document
      document.body.removeChild(link);
      setDownloadInProgress(false);
      console.log("MP3 file downloaded successfully!");
    } catch (error) {
      setDownloadInProgress(false);

      console.error("Error downloading or saving the MP3 file:", error);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {response?.videos?.map((video, index) => (
        <div key={index} className="bg-white p-5 w-fit flex flex-col rounded-3xl space-y-3">
          <h2 className="text-2xl font-bold w-full text-center">
            {video.channel}-{video.title}
          </h2>
          <div className="flex justify-around items-center">
            <Image
              src={video.thumbnail || logo} // Use fetched thumbnail if available, otherwise fall back to logo
              alt={video.title}
              width={150} // Example width
              height={150} // Example height
              className="rounded-md"
            />
            <div className="px-5 space-y-2">
              <p className="text-xl">
                Duration: {formatDuration(video.duration)}
              </p>
              <div className="flex justify-center items-center">
                <button
                  className="bg-[#a63187] px-9 py-3 rounded-xl flex items-center space-x-2"
                  onClick={() => handleDownload(video.originalUrl)}
                >
                  <p>Download</p>
                  {downloadInProgress ? <CircleLoader /> : null}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
