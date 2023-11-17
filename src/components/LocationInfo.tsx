/** @format */

import React, { useState, useEffect } from "react";

interface Venue {
  id: string;
  Address: string; // 新增字段
  City: string; // 新增字段
  District: string;
  Name: string;
  // ...其他字段，如果有的话
}

interface LocationInfoProps {
  venues: Venue[];
  districts: string[];
  activeCounty: string | null;
  onVenueSelected: (venueId: string) => void;
}

const LocationInfo: React.FC<LocationInfoProps> = ({
  venues,
  districts,
  activeCounty,
  onVenueSelected,
}) => {
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

  // LocationInfo 组件中

  const handleVenueChange = (e) => {
    console.log(e.target.value);
    const venueId = e.target.value; // 这里获取选中的 venueId
    setSelectedVenue(venueId); // 设置选中的 venue
    onVenueSelected(venueId); // 将 venueId 传递给父组件
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
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={selectedVenue}
            onChange={handleVenueChange} // 使用 handleVenueChange 函数
          >
            <option value="">選擇展演空間</option>
            {venuesInDistrict.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.Name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;
