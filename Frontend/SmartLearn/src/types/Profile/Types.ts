export interface ProfileData {
  id: number;
  email: string;
  full_name: string;
  role: "student" | "teacher";
  avatar: string | null;
  bio: string;
  location: string;
  department: string;
  phone_number: string;
  birth_date: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  github_url: string | null;
}