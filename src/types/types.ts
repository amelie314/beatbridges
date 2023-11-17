// types.ts
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
  createdAt: Date;
  userId: string;
  userName: string;
  venueId: string;
  text: string;
  performanceName: string;
  date: string;
}
