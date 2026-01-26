
export interface Tour {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  itinerary: string[];
  image: string;
}

export interface ReservationFormData {
  fullName: string;
  phone: string;
  date: string;
  peopleCount: number;
  tourId: string;
}

export enum Section {
  HOME = 'home',
  TOURS = 'tours',
  INFO = 'info',
  RESERVATION = 'reservation',
  EDITOR = 'editor'
}
