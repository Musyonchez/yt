import React, { useState } from "react";
import Howto from "./Howto";
import About from "./About";
import axios from "axios";
import SearchResults from "./SearchResults";
import sanitizeSearch from "../utils/sanitizeSearch";
import WaveLoader from "@/utils/WaveLoader";

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

const Hero = () => {
  const [searchInput, setSearchInput] = useState("");
  const [singleResponse, setSingleResponse] = useState(null);
  const [playlistResponses, setPlaylistResponses] = useState<
    PlaylistResponse[]
  >([]);
  const [loader, setLoader] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = async () => {
    console.log("Searching for:", searchInput);
    try {
      setLoader(true);
      const sanitizedText = sanitizeSearch({ searchInput });
      console.log("sanitizedText:", sanitizedText);
      if (sanitizedText === "single video youtube link") {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/v1/url/info/single",
          {
            url: searchInput,
          }
        );
        console.log(response.data);
        setSingleResponse(response.data);
      } else if (sanitizedText === "playlist youtube link") {
        const playlistResponse = await axios.post(
          "http://127.0.0.1:8000/api/v1/url/info/playlist",
          {
            url: searchInput,
          }
        );
        console.log(playlistResponse.data);

        // Extracting video URLs from the playlist response
        const videoUrls = playlistResponse.data.videos.map(
          (video: Video) => video.originalUrl
        );

        // Initialize an empty array to hold the fetched video details
        let fetchedVideoDetails = [];

        // Loop through each URL and fetch details one by one
        for (const url of videoUrls) {
          const videoDetailsPromise = axios.post(
            "http://127.0.0.1:8000/api/v1/url/info/single",
            {
              url: url,
            }
          );

          console.log("url:", url);

          // Wait for the promise to resolve
          const videoDetailsResponse = await videoDetailsPromise;

          // Extract the data from the response
          const videoDetailsData = videoDetailsResponse.data;
          console.log("videoDetailsData:", videoDetailsData);

          // Add the fetched video details to the array
          fetchedVideoDetails.push(videoDetailsData);

          // Update the state with the new details
          setPlaylistResponses(fetchedVideoDetails);
          console.log("Updated setPlaylistResponses:", fetchedVideoDetails);
        }
        console.log("PlaylistResponses:", playlistResponses);

        // After the loop ends, setPlaylistResponses should contain details for all videos
      } else if (sanitizedText === "textsearch") {
        console.log("word search", sanitizedText);
      } else {
        console.log("cant search");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full space-y-10">
      <div className="border-8 border-purple-200 rounded-lg w-fit mt-10">
        <input
          type="text"
          className="border-2 w-96 h-11 px-1"
          placeholder="Enter a name (song or artist) or URL (video or playlist)"
          value={searchInput}
          onChange={handleInputChange}
          required
        />
        <button className="px-3" onClick={handleSearch}>
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
