export type UserRole = "DEVELOPER" | "CLIENT";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ABANDONED" | "SUPPORTED" | "PLANNING";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface ProjectListItem {
  id: number;
  title: string;
  description?: string;
  status: ProjectStatus;
  visibility: boolean;
  hidden: boolean;
  useForPortfolio: boolean;
  /** Технологии, перечисленные через запятую (как в БД). */
  techStack: string;
  canOpen: boolean;
  archivedAt?: string | null;
  isAssigned: boolean;
  members: Array<Pick<User, "id" | "name">>;
}

export interface ChatMessage {
  id: number;
  text: string;
  createdAt: string;
  sentAt?: string | null;
  author: Pick<User, "id" | "name" | "role">;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  order: number;
  assignee?: Pick<User, "id" | "name" | "role"> | null;
}

export interface ProjectImage {
  id: number;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  createdAt: string;
  uploadedBy: Pick<User, "id" | "name">;
}
