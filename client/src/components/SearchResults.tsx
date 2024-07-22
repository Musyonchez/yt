import React, { useEffect, useState } from "react";
import Image from "next/image";
import formatDuration from "../utils/formatDuration";
import axios from "axios";
import WaveLoader from "@/utils/WaveLoader";
import CircleLoader from "@/utils/CircleLoader";
import logo from "../../public/images/black-logo.png";
import handleDownload from "@/utils/handleDownload";

interface VideoInfo {
  originalUrl: string;
  title: string;
  channel: string;
  duration: number; // Duration in seconds
  thumbnail: string;
}

const SearchResults = ({
  response,
}: {
  response: { type: string; videos: VideoInfo[] };
}) => {
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  return (
    <div className="flex flex-wrap justify-center gap-4 w-full px-5 sm:px-24">
      {response?.videos?.map((video, index) => (
        <div
          key={index}
          className="bg-white p-5 w-full flex flex-col rounded-3xl space-y-3"
        >
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
            <div className="px-2 sm:px-5 space-y-2">
              <p className="text-xl">
                Duration: {formatDuration(video.duration)}
              </p>
              <div className="flex justify-center items-center">
                <button
                  className="bg-[#a63187] px-9 py-3 rounded-xl flex items-center space-x-2"
                  onClick={() =>
                    handleDownload(video.originalUrl, setDownloadInProgress)
                  }
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
