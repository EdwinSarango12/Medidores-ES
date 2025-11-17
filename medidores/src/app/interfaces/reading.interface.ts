export interface Reading {
  id?: string;
  user_id: string;
  meter_number: string;
  reading_value: number;
  reading_date: string;
  meter_photo_url: string;
  house_photo_url: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface CreateReadingDto {
  meter_number: string;
  reading_value: number;
  reading_date: string;
  meter_photo_url: string;
  house_photo_url: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  notes?: string;
}

export interface UpdateReadingDto extends Partial<CreateReadingDto> {
  status?: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}
