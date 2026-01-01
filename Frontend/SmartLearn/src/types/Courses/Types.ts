// TYPES RELATED TO COURSES
export interface CourseSummary {
    id: number;
    title: string;
    description: string;
    status: 'draft' | 'published' | 'archived'; 
    created_at: string;
    lecture_count: number;
    content_source_count: number;
}