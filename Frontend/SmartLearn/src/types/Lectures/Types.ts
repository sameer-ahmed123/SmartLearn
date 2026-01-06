//  for non validated Lectures
interface QueueCourse {
    title:string
}

interface QueueContentSource{
    id: number,
    ai_prompt :string,
    course : QueueCourse
}

export interface LectureQueueItem{
    id:number,
    topic:string,
    created_at:string,
    validation_status : 'validated'| 'rejected' | 'pending',
    content_source : QueueContentSource,
    status_display: string,
    review_url :string
}

// for Lecture Details
interface Course{
    title:string
}
interface Teacherinterface{
    id:number,
    full_name:string,
    email:string
}
interface ContentSource{
    id:number,
    course:Course,
    ai_prompt:string,
    raw_file:string,
    uploaded_by:Teacherinterface
}

export interface LectureDetails{
    id:number,
    topic:string,
    video_url:string,
    summary_text:string,
    validation_status: 'validated'|'rejected'|'pending',
    status_display:string,
    rejection_comment:string,
    generated_by:string,
    validated_by:string,
    created_at:string,
    content_source:ContentSource,
}

// list of lectures to a course
export interface CourseContentItem {
  id: number;
  topic: string;
  validation_status: 'pending' | 'validated' | 'rejected';
  status_display: string;
  course_topic: string; 
  created_at: string;
  review_url :string,
//   quiz_id?: number;
}


