import React, { useState } from "react";
import Image from "next/image";
import logo from "../../public/images/black-logo.png";
import Link from "next/link";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className=" min-h-screen flex flex-col justify-between p-4 space-y-3">
      <div className=" flex items-center">
        <div className=" flex-1">
          <Link href="/">
          <Image src={logo} alt={"logo"} width={200} height={200} />
          </Link>
        </div>
        <h1 className=" flex-1 font-extrabold text-lg">
          Frequently Asked Questions
        </h1>
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(0)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 0
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1> 1. How do I download a song or video?</h1>{" "}
        </button>
        {activeIndex === 0 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              Users can simply enter the name of the song, artist, or the URL of
              the video or playlist they wish to download into the search bar.
              The service will then fetch and convert the audio from YouTube
              into a downloadable MP3 format.{" "}
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(1)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 1
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>2. What formats are available for download?</h1>{" "}
        </button>
        {activeIndex === 1 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              The service primarily offers downloads in MP3 format, ensuring
              high-quality audio playback on various devices.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(2)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 2
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>3. Is it legal to download music and videos from YouTube?</h1>{" "}
        </button>
        {activeIndex === 2 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              While the legality of downloading content from YouTube varies by
              jurisdiction, users should ensure they comply with copyright laws
              and the terms of service of the platform they are downloading
              from.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(3)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 3
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>4. Can I download playlists?</h1>{" "}
        </button>
        {activeIndex === 3 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              Yes, users can download entire playlists by entering the playlist
              URL into the search bar.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(4)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 4
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>5. How do I customize my download preferences?</h1>{" "}
        </button>
        {activeIndex === 4 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              Users can specify download options such as audio quality, file
              format, and whether to include album art in the settings or
              through custom options in the download request.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(5)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 5
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>6. Are there any limitations on the number of downloads?</h1>{" "}
        </button>
        {activeIndex === 5 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              The service typically allows unlimited downloads for registered
              users, subject to fair use policies and any restrictions imposed
              by the underlying platforms.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(6)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 6
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>7. How secure is my data and privacy?</h1>{" "}
        </button>
        {activeIndex === 6 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              The service employs standard security measures to protect user
              data and privacy. Personal information is handled securely, and
              user activity is logged for troubleshooting and improvement
              purposes only.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(7)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 7
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>8. Does the service support mobile devices?</h1>{" "}
        </button>
        {activeIndex === 7 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              Yes, the service is optimized for use on desktop computers,
              laptops, and mobile devices, ensuring a seamless experience across
              platforms.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(8)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 8
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>9. How do I report a problem or request a feature?</h1>{" "}
        </button>
        {activeIndex === 8 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              Users can contact customer support through the website&apos;s
              contact form or email, detailing their issue or feature request
              for prompt assistance.
            </p>{" "}
          </div>
        )}
      </div>
      <div className=" bg-gray-100 rounded-lg shadow-md">
        <button
          onClick={() => toggleItem(9)}
          className={` w-full text-left py-2 px-4 font-semibold transition-colors duration-200 ease-in-out ${
            activeIndex === 9
              ? "text-blue-500 bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          <h1>10. Is there a cost associated with using the service?</h1>{" "}
        </button>
        {activeIndex === 9 && (
          <div className=" mt-2 pl-4 pr-4 pb-2 pt-2 bg-white rounded-b-lg">
            <p>
              The basic features of the service are offered for free, though
              premium features or higher quality downloads may require a
              subscription fee.
            </p>{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ;
