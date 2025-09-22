// Shared types for the IoT Lock App

export interface Visitor {
  id: string;
  name: string;
  date: string;
  time: string;
  status: 'accepted' | 'rejected';
  image: string;
}

export interface VisitorRequest {
  name: string;
  photos: string[];
}

export interface Photo {
  id: string;
  uri: string;
}