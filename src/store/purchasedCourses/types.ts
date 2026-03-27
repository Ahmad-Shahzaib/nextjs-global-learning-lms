export interface PurchasedCourse {
  id: number;
  image: string;
  image_cover: string;
  status: string;
  title: string;
  can: {
    view: boolean;
  };
  reviews_count: number;
  can_view_error: string | null;
  type: string;
  link: string;
  label: string;
  progress: number;
  progress_percent: number;
  price: string;
  best_ticket: string;
  active_special_offer: string | null;
  rate: number;
  access_days: string;
  expired: boolean;
  expire_on: number;
  category: string;
  sales_amount: string;
  sales_count: number;
  created_at: string;
  purchased_at: string;
  start_date: string | null;
  duration: string;
  specification: {
    duration: string;
    files_count: number;
    downloadable: boolean;
  };
  teacher: {
    id: number;
    full_name: string;
    role_name: string | null;
    bio: string | null;
    offline: string | null;
    offline_message: string | null;
    verified: boolean | null;
    rate: number;
    avatar: string;
    meeting_status: string;
    user_group: string | null;
    address: string | null;
  };
  capacity: string;
}
