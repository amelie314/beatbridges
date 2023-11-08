/** @format */

import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// LocationInfo.tsx

interface Venue {
  id: string;
  Name: string;
  City: string;
  District?: string;
}

// 在您的 React 组件中使用传递的数据
const LocationInfo = ({ venues }) => {
  return (
    <div>
      <h1 className="text-10">Venues</h1>
      {venues.map((venue) => (
        <div key={venue.id}>
          <h3> {venue.Name}</h3>
          <p className="mb-5">
            {venue.City}
            {venue.District}
            {venue.Address}
          </p>
        </div>
      ))}
    </div>
  );
};

// function LocationInfo() {
//   return (
//     // <div className="flex-1 p-6 rounded-lg shadow-md bg-primary-color ml-[100px]">
//     <div>
//       <div className="main_location">
//         <div className="main_location_county">
//           <div className="main_location_county_title">
//             {/* City selection menu */}
//             <span className="main_location_county_query">選取縣市：</span>
//             <select
//               id="citySelect"
//               className="main_location_county_result"
//               // value={selectedCity}
//               // onChange={e => onCityChange(e.target.value)}
//             >
//               <option value="default">請選擇城市</option>
//               {/* Add other options here */}
//             </select>
//           </div>
//           {/* ...其他的组件或内容... */}
//         </div>
//       </div>
//     </div>
//   );
// }

export default LocationInfo;
