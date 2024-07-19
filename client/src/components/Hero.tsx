import React, { useState } from "react";
import Howto from "./Howto";
import About from "./About";
import axios from "axios";
import SearchResults from "./SearchResults";
import sanitizeSearch from "../utils/sanitizeSearch";
import WaveLoader from "@/utils/WaveLoader";

// Define the handleSearch function using useState to manage the input value
const Hero = () => {
  const [searchInput, setSearchInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loader, setLoader] = useState(false);

  // Update the searchInput state whenever the input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  // Perform the search action when the button is clicked
  const handleSearch = async () => {
    console.log("Searching for:", searchInput); // Replace this with actual search logic
    try {
      setLoader(true)
      // Replace 'yourUrlString' with the actual URL string you want to send
      // const searchInput = "https://www.youtube.com/watch?v=QjihRb2E-YA";
      const sanitizedText = sanitizeSearch({ searchInput });
      console.log("sanitizedText:", sanitizedText); // Replace this with actual search logic
      if (sanitizedText === "youtubelink") {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/v1/url/info",
          {
            url: searchInput,
          }
        );
        console.log(response.data);
        setResponse(response.data); // Update the state with the response data
        setLoader(false)
      } else if (sanitizedText === "textsearch") {
        console.log("word search", sanitizedText);
      } else {
        console.log("cant search");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full space-y-10">
      <div className="border-8 border-purple-200 rounded-lg w-fit mt-10">
        <input
          type="text"
          className="border-2 w-96 h-11 px-1"
          placeholder="Enter a name (song or artist) or URL (video or playlist)"
          value={searchInput} // Bind the input value to the searchInput state
          onChange={handleInputChange} // Handle input changes
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
