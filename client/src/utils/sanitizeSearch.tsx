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
    if (searchInput.includes("?v=")) {
      if (
        searchInput.includes("&list=") &&
        (searchInput.includes("&index=") ||
          searchInput.includes("&start_radio"))
      ) {
        return "single video youtube link in a playlist";
      } else if (searchInput.includes("&list=")) {
        return "playlist youtube link";
      } else {
        return "single video youtube link";
      }
    } else {
      return "unsupported youtube link";
    }
  } else {
    // Logic for other cases
    console.log("Not a YouTube link");
    // Handle other cases as needed
    return "textsearch";
  }
};

export default sanitizeSearch;
