/** @format */

import { GetServerSideProps } from "next";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// LocationInfo 组件
const LocationInfo = ({ venues }) => {
  // venues 属性应该是父组件传递的，已经根据 activeCounty 筛选过的场馆列表
  return (
    <div>
      <h1>Venues</h1>
      {venues.map((venue) => (
        <div key={venue.id}>
          <h3> {venue.Name}</h3>
          <p>
            {venue.City}
            {venue.District}
            {venue.Address}
          </p>
        </div>
      ))}
    </div>
  );
};

export default LocationInfo;
