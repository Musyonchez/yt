import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/black-logo.png";
import FAQ from "./FAQ";

const Navbar = () => {
  return (
    <div className=" w-full flex justify-between items-center px-5 pt-2">
      <div></div>
      <div>
        <Image src={logo} alt={"logo"} width={200} height={200} />
      </div>
      <div>
        <button>
          <Link href="frequently_asked_questions">
          <h3 className=" text-lg font-bold">FAQ</h3>
          </Link>
          </button>
          <button>
            Github
          </button>
      </div>
    </div>
  );
};

export default Navbar;
