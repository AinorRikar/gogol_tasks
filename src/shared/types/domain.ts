export type UserRole = "DEVELOPER" | "CLIENT";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ABANDONED" | "SUPPORTED" | "PLANNING";

export interface User {
  id: number;
  name: string;
  login: string;
  role: UserRole;
}

export interface UserProjectRef {
  id: number;
  title: string;
}

export interface ClientWithProjects extends User {
  role: "CLIENT";
  projects: UserProjectRef[];
}

export interface ProjectListItem {
  id: number;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  version?: string;
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

export interface ProjectReferenceBlock {
  id: number;
  projectId: number;
  title: string;
  content: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectLink {
  id: number;
  projectId: number;
  url: string;
  title: string;
  iconUrl: string;
  order: number;
  createdAt: string;
}
