export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface StudentProfile extends User {
  role: 'student';
  gradeLevel: string;
  parentId?: string;
  preferences: {
    subjects: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic';
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  progress: {
    totalPoints: number;
    level: number;
    completedLessons: number;
    streak: number;
  };
}

export interface ParentProfile extends User {
  role: 'parent';
  children: string[];
  notifications: {
    progress: boolean;
    achievements: boolean;
    assignments: boolean;
  };
}

export interface TeacherProfile extends User {
  role: 'teacher';
  subjects: string[];
  classes: string[];
  permissions: {
    createAssignments: boolean;
    gradeAssignments: boolean;
    viewAllStudents: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  gradeLevel?: string;
  parentEmail?: string;
}