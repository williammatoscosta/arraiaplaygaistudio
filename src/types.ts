export interface MediaItem {
  id: string;
  name: string;
  duration: string;
  src?: string;
  children?: MediaItem[];
  isFolder?: boolean;
}
