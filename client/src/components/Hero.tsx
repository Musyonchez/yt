import React, { useState } from "react";
import Howto from "./Howto";
import About from "./About";
import axios from "axios";
import SearchResults from "./SearchResults";
import sanitizeSearch from "../utils/sanitizeSearch";
import WaveLoader from "@/utils/WaveLoader";
import handleSearch from "../utils/handleSearch";

interface Video {
  originalUrl: string;
}

interface VideoInfo {
  originalUrl: string;
  title: string;
  channel: string;
  duration: number; // Duration in seconds
  thumbnail: string;
}
interface PlaylistResponse {
  type: string;
  videos: VideoInfo[];
}

interface SingleResponse {
  type: string;
  videos: VideoInfo[];
}

const Hero = () => {
  const [searchInput, setSearchInput] = useState("");
  const [singleResponse, setSingleResponse] = useState<PlaylistResponse | null>(
    null
  );
  const [playlistResponses, setPlaylistResponses] = useState<
    PlaylistResponse[]
  >([]);
  const [loader, setLoader] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full space-y-10 px-2">
      <div className="border-8 border-purple-200 rounded-lg w-full sm:w-fit mt-10 flex flex-col sm:flex-row">
        <input
          type="text"
          className="border-2 w-full sm:w-96 h-11 px-1 max-sm:text-center"
          placeholder="Enter a URL (video or playlist)"
          value={searchInput}
          onChange={handleInputChange}
          required
        />
        <button
          className="px-3 max-sm:py-1 w-full sm:w-fit"
          onClick={() =>
            handleSearch(
              searchInput,
              setLoader,
              setSingleResponse,
              setPlaylistResponses
            )
          }
        >
          Search
        </button>
      </div>
      {loader ? <WaveLoader /> : null}
      {!singleResponse && playlistResponses.length === 0 ? (
        <>
          <About />
          <Howto />
        </>
      ) : (
        <>
          {singleResponse && <SearchResults response={singleResponse} />}
          {playlistResponses.map((responseItem, index) => (
            <SearchResults key={index} response={responseItem} />
          ))}
        </>
      )}
    </div>
  );
};

export default Hero;
