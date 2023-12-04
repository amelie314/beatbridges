// 導入方式對於 Firebase v9 或更新的版本
import { FieldValue } from "firebase/firestore";

// types.ts
export interface LocationInfoProps {
  venues: Venue[];
  districts: string[];
  activeCounty: string | null;
  onVenueSelected: (venueId: string) => void;
}

export interface Venue {
    id: string;
    Address: string;
    City: string;
    District: string;
    Name: string;
    // ...其他需要的属性...
  }
  
export interface Review {
  id: string;
  // createdAt: Date;
  userId: string;
  venueId: string;
  text: string;
  performanceName: string;
  date: string;
  likes: number;
  createdAt: FieldValue;
}
export interface ReviewWithVenue extends Review {
  venueName: string;
}


export interface UserData {
  displayName: string;
  username: string;
  bio: string;
  photoURL: string;
  uid?: string;
}

