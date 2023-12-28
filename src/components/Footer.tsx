/** @format */

import React from "react";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer = () => {
  return (
    <footer className="bg-primary-color text-secondary-color pt-5 pb-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center sm:flex-row justify-between">
          <p className="text-xs sm:text-sm text-center sm:text-left mb-2 sm:mb-0">
            © 2023 Taiwan Concert Venues Map.
          </p>
          <div className="flex justify-center items-center">
            <a
              href="https://github.com/amelie314"
              className="text-lg"
              aria-label="Github"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
