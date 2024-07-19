import React from "react";
import Image from "next/image";
import formatDuration from "../utils/formatDuration";
import axios from "axios";
import WaveLoader from "@/utils/WaveLoader";

interface VideoInfo {
  originalUrl: string;
  title: string;
  channel: string;
  duration: number; // Duration in seconds
  thumbnail: string;
}

const handleDownload = async (searchInput: string) => {
  try {
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

    console.log("MP3 file downloaded successfully!");
  } catch (error) {
    console.error("Error downloading or saving the MP3 file:", error);
  }
};

const SearchResults = ({ response }: { response: VideoInfo }) => {
  return (
    <div className=" flex flex-col w-full justify-center items-center px-7">
      <div className=" bg-white p-5 w-fit flex flex-col rounded-3xl space-y-3">
        <h2 className=" text-2xl font-bold w-full text-center">
          {response.channel}-{response.title}
        </h2>
        <div className=" flex justify-around items-center">
          <Image
            src={response.thumbnail}
            alt={response.title}
            width={150} // Example width
            height={150} // Example height
            className=" rounded-md"
          />
          <div className=" px-5 space-y-2">
            <p className=" text-xl">
              Duration: {formatDuration(response.duration)}
            </p>
            <div className=" flex justify-center items-center">
              <button
                className=" bg-[#a63187] px-9 py-3 rounded-xl"
                onClick={() => handleDownload(response.originalUrl)}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
