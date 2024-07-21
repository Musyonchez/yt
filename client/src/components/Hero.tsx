import React, { useState } from "react";
import Howto from "./Howto";
import About from "./About";
import axios from "axios";
import SearchResults from "./SearchResults";
import sanitizeSearch from "../utils/sanitizeSearch";
import WaveLoader from "@/utils/WaveLoader";

const Hero = () => {
  const [searchInput, setSearchInput] = useState("");
  const [response, setResponse] = useState(null);
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
        setResponse(response.data);
      } else if (sanitizedText === "single video youtube link in a playlist") {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/v1/url/info/playlist",
          {
            url: searchInput,
          }
        );
        console.log(response.data);
        setResponse(response.data);
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
      {!response ? (
        <>
          <About />
          <Howto />
        </>
      ) : (
        <SearchResults response={response} />
      )}
    </div>
  );
};

export default Hero;
