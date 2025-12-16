export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for user upload or generated image
  isLoading?: boolean;
  type?: 'text' | 'image' | 'mixed';
}

export interface UserPreferences {
  diet: 'Veg' | 'Non-Veg' | 'Vegan' | 'Any';
  cuisine: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert';
  allergies: string;
  language: 'English' | 'Hindi' | 'Hinglish';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  diet: 'Any',
  cuisine: 'Any',
  skillLevel: 'Beginner',
  allergies: '',
  language: 'English',
};

export enum LoadingState {
  IDLE = 'idle',
  SENDING = 'sending',
  GENERATING_IMAGE = 'generating_image',
  GENERATING_AUDIO = 'generating_audio',
}
