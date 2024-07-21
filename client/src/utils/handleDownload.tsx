import axios from "axios";

const handleDownload = async (
  searchInput: string,
  setDownloadInProgress: (value: boolean) => void
) => {
  try {
    setDownloadInProgress(true);
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
    setDownloadInProgress(false);
    console.log("MP3 file downloaded successfully!");
  } catch (error) {
    setDownloadInProgress(false);

    console.error("Error downloading or saving the MP3 file:", error);
  }
};

export default handleDownload;
