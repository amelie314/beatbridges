/** @format */

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Venue } from "../types/types";
import { LocationInfoProps } from "../types/types"; // 從types檔案中import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

const LocationInfo: React.FC<LocationInfoProps> = ({
  venues,
  districts,
  activeCounty,
  onVenueSelected,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");

  // 轉換 venues 為 react-select 的 options 格式
  const districtOptions = Array.from(
    new Set(
      venues.map((venue) => ({
        value: venue.District,
        label: venue.District,
      }))
    )
  );

  const venueOptions = venues
    .filter((venue) => venue.District === selectedDistrict)
    .map((venue) => ({
      value: venue.id,
      label: venue.Name,
    }));

  // 使用 Set 去重新得到唯一的行政區列表
  const uniqueDistricts = Array.from(
    new Set(venues.map((venue) => venue.District))
  );

  // 當 activeCounty 更新時，重置 selectedDistrict 和 selectedVenue
  useEffect(() => {
    setSelectedDistrict("");
    setSelectedVenue("");
  }, [activeCounty]);

  // 當 selectedDistrict 更新時，重置 selectedDistrict 和 selectedVenue
  useEffect(() => {
    setSelectedVenue(""); // 清除展演空間選擇
    onVenueSelected(""); // 通知父組件重置 selectedVenueId
  }, [selectedDistrict]);

  // 篩選當前選定行政區的展演空間
  const venuesInDistrict = venues.filter(
    (venue) => venue.District === selectedDistrict
  );

  // LocationInfo 组件中
  const handleVenueChange = (e) => {
    // console.log(e.target.value);
    const venueId = e.target.value; // 這裡獲取選中的 venueId
    setSelectedVenue(venueId); // 更新本地狀態
    onVenueSelected(venueId); // 通知父組件已選擇的 venueId
  };
  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "#fff",
      borderColor: state.isFocused ? "blue" : "gray",
      boxShadow: state.isFocused ? "0 0 0 1px blue" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "blue" : "gray",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "4px",
      marginTop: "0",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "lightgray" : "none",
      color: "black",
      "&:active": {
        background: "lightblue",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "black",
    }),
  };

  // 新增一個函數來處理 Google 搜尋
  const handleSearch = () => {
    const venueName = venues.find((venue) => venue.id === selectedVenue)?.Name;
    if (venueName) {
      // 使用 window.open 來在新視窗中打開 Google 搜尋頁面
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(venueName)}`
      );
    }
  };

  return (
    <div className="mt-8">
      <div>
        <p className="text-white pb-2 text-[18px] font-bold slide-in-right">
          Begin your adventure, Click on the map🖱️
        </p>
        <p className="text-white pb-2 text-[16px]">
          🚩 Currently Selected County/City： {activeCounty}
        </p>
      </div>
      {activeCounty && (
        <div className="mt-3">
          <label
            htmlFor="district-select"
            className="block mb-2 text-sm font-medium text-gray-900"
          ></label>
          <select
            id="district-select"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedVenue(""); // 重置展演空間的選擇
            }}
          >
            <option value="" disabled>
              Select District
            </option>
            {uniqueDistricts.map((district: string, index) => (
              <option key={index.toString()} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedDistrict && (
        <div className="mt-4">
          <label
            htmlFor="venue-select"
            className="block mb-2 text-sm font-medium text-gray-900"
          ></label>
          <select
            id="venue-select"
            // className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            className="bg-gray-200 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-primary-500 block w-full p-2.5"
            value={selectedVenue}
            onChange={handleVenueChange} // 使用 handleVenueChange 函数
          >
            <option value="" disabled>
              Choose Performance Venue
            </option>
            {venuesInDistrict.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.Name}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedVenue && (
        <div className="mt-4">
          <button
            className="flex items-center text-white border border-[#353535] hover:text-white hover:bg-[#353535] font-bold py-2 px-4 rounded-lg"
            onClick={handleSearch}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 48 48"
              className="mr-2"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            {venues.find((venue) => venue.id === selectedVenue)?.Name}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;
