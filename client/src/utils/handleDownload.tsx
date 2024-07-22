import axios from "axios";

const handleDownload = async (
  searchInput: string,
  setDownloadInProgress: (value: boolean) => void,
  videoChannel: string,
  videoTitle: string
) => {
  try {
    setDownloadInProgress(true);
    const response = await axios.post(
      "https://yt-ojvw.onrender.com/api/v1/url/audio",
      {
        url: searchInput,
      },
      {
        responseType: "blob", // Ensure the response is a Blob
      }
    );

    // Create a link element
    const link = document.createElement("a");
    // Create a URL for the Blob and set it as the href attribute
    link.href = window.URL.createObjectURL(new Blob([response.data], { type: "audio/mpeg" }));
    // Set the download attribute with a filename
    link.download = `${videoChannel}-${videoTitle}.mp3`;
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

export default handleDownload;
