import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/black-logo.png";
import FAQ from "./FAQ";

const Navbar = () => {
  return (
    <div className=" w-full flex justify-between items-center px-2 sm:px-5 pt-2">
      <div className=" hidden sm:flex"></div>
      <div>
        <Image src={logo} alt={"logo"} width={200} height={200} />
      </div>
      <div className=" space-x-2 ml-2">
        <button>
          <Link href="frequently_asked_questions">
            <h3 className=" text-lg font-bold">FAQ</h3>
          </Link>
        </button>
        {/* GitHub Button */}
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <Link href="https://github.com/Musyonchez/yt" target="_blank" rel="noopener noreferrer">
            Github
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
