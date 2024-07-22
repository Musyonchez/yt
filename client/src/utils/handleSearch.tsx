import axios from "axios";
import sanitizeSearch from "./sanitizeSearch";

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

const handleSearch = async (
  searchInput: string,
  setLoader: (value: boolean) => void,
  setSingleResponse: (data: SingleResponse | null) => void,
  setPlaylistResponses: (data: PlaylistResponse[]) => void
) => {
  console.log("Searching for:", searchInput);
  try {
    setLoader(true);
    setSingleResponse(null);
    setPlaylistResponses([]);
    const sanitizedText = sanitizeSearch({ searchInput });
    console.log("sanitizedText:", sanitizedText);
    if (
      (sanitizedText as string) === "single video youtube link" ||
      (sanitizedText as string) === "single video youtube link in a playlist"
    ) {
      const response = await axios.post(
        "https://yt-ojvw.onrender.com/api/v1/url/info/single",
        {
          url: searchInput,
        }
      );
      console.log(response.data);
      setSingleResponse(response.data);
    } else if (sanitizedText === "playlist youtube link") {
      const playlistResponse = await axios.post(
        "https://yt-ojvw.onrender.com/api/v1/url/info/playlist",
        {
          url: searchInput,
        }
      );
      console.log(playlistResponse.data);

      const videoUrls = playlistResponse.data.videos.map(
        (video: Video) => video.originalUrl
      );

      let fetchedVideoDetails = [];

      for (const url of videoUrls) {
        const videoDetailsPromise = axios.post(
          "https://yt-ojvw.onrender.com/api/v1/url/info/single",
          {
            url: url,
          }
        );

        console.log("url:", url);

        const videoDetailsResponse = await videoDetailsPromise;

        const videoDetailsData = videoDetailsResponse.data;
        console.log("videoDetailsData:", videoDetailsData);

        fetchedVideoDetails.push(videoDetailsData);

        console.log("Updated setPlaylistResponses:", fetchedVideoDetails);
        setPlaylistResponses(fetchedVideoDetails);
      }
      console.log("PlaylistResponses:", fetchedVideoDetails);
    } else if (sanitizedText === "textsearch") {
      console.log("word search", sanitizedText);
    } else {
      console.log("can't search");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoader(false);
  }
};

export default handleSearch;
