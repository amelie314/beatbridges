/** @format */

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Venue } from "../types/types";
import { LocationInfoProps } from "../types/types"; // 從types檔案中import

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
    console.log(e.target.value);
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
    <div className="mb-4">
      <div>目前選擇的縣市為： {activeCounty}</div>
      <div className="mt-4">
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
            選擇區域
          </option>
          {uniqueDistricts.map((district: string, index) => (
            <option key={index.toString()} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>
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
              選擇展演空間
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
            className="text-white border border-[#353535] hover:text-white hover:bg-[#353535] font-bold py-2 px-4 rounded-lg"
            onClick={handleSearch}
          >
            🔍️ &nbsp;
            {venues.find((venue) => venue.id === selectedVenue)?.Name}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;
