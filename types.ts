
export enum TourType {
  LAGOON = 'Passeio na Lagoa',
  NATURAL_POOLS = 'Piscinas Naturais',
  PRIVATE = 'Passeio Privativo'
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  date: string;
  peopleCount: number;
  tourType: TourType;
}

export interface GeminiPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}
