export interface Post {
    id: number;
    title: string;
    content: string;
    category: string; // ex: "자유게시판", "정보게시판" 등
    created_at: string;
    author_id?: string;
    author_name?: string;
  }
  