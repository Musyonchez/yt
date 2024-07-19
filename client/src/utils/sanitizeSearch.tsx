import React from "react";

// Define the interface outside of the component if it will be reused elsewhere
interface SearchInfo {
  searchInput: string;
}

// Adjust the function to accept an argument of type SearchInfo
const sanitizeSearch = ({ searchInput }: SearchInfo) => {
  // Check if searchInput starts with "https://www.youtube.com/"
  if (searchInput.startsWith("https://www.youtube.com/")) {
    // Logic for when searchInput starts with "https://www.youtube.com/"
    console.log("YouTube link detected");
    // You might want to handle YouTube links differently here
    return ("youtubelink");
  } else {
    // Logic for other cases
    console.log("Not a YouTube link");
    // Handle other cases as needed
    return ("textsearch");
  }
};

export default sanitizeSearch;
