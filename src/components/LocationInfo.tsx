/** @format */

import React, { useState, useEffect } from "react";

const LocationInfo = ({ venues, activeCounty }) => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");

  // 使用 Set 去重，得到唯一的行政區列表
  const uniqueDistricts = Array.from(
    new Set(venues.map((venue) => venue.District))
  );

  // 當 activeCounty 更新時，重置 selectedDistrict 和 selectedVenue
  useEffect(() => {
    setSelectedDistrict("");
    setSelectedVenue("");
  }, [activeCounty]);

  // 篩選當前選定行政區的展演空間
  const venuesInDistrict = venues.filter(
    (venue) => venue.District === selectedDistrict
  );

  // 当选择区域发生变化时调用此函数
  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    // 重置展演空间的选择
    setSelectedVenue(null);
  };

  return (
    <div>
      <div>目前選擇的縣市為: {activeCounty}</div>
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
          {uniqueDistricts.map((district) => (
            <option key={district} value={district}>
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
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
          >
            <option value="" disabled>
              選擇展演空間
            </option>
            {venuesInDistrict.map((venue) => (
              <option key={venue.Name} value={venue.Name}>
                {venue.Name}
              </option>
            ))}
          </select>{" "}
        </div>
      )}
    </div>
  );
};

export default LocationInfo;
