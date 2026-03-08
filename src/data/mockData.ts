import { CourseDto, PostDto, SolutionDto, MemberDto } from '../types/api';

export const mockCourses: CourseDto[] = [
  {
    id: 'mock-course-1',
    name: 'Основы программирования',
    description: 'Изучение основ программирования на JavaScript',
    createdAt: '2024-01-15T10:00:00Z',
    currentUserRole: 'TEACHER',
    teacherCount: 2,
    studentCount: 15
  },
  {
    id: 'mock-course-2',
    name: 'Веб-разработка',
    description: 'Создание современных веб-приложений с React',
    createdAt: '2024-02-01T10:00:00Z',
    currentUserRole: 'STUDENT',
    teacherCount: 1,
    studentCount: 20
  },
  {
    id: 'mock-course-3',
    name: 'Базы данных',
    description: 'Работа с SQL и NoSQL базами данных',
    createdAt: '2024-03-01T10:00:00Z',
    currentUserRole: 'TEACHER',
    teacherCount: 1,
    studentCount: 12
  }
];

export const mockPosts: Record<string, PostDto[]> = {
  'mock-course-1': [
    {
      id: 'mock-post-1',
      title: 'Введение в JavaScript',
      content: 'Изучите основы синтаксиса JavaScript, переменные и типы данных.',
      type: 'MATERIAL',
      deadline: null,
      author: {
        id: 'mock-teacher-1',
        username: 'teacher1',
        displayName: 'Преподаватель Иванов',
        createdAt: '2024-01-10T10:00:00Z'
      },
      materialsCount: 2,
      commentsCount: 5,
      solutionsCount: 0,
      mySolutionId: null,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      id: 'mock-post-2',
      title: 'Задание 1: Создание калькулятора',
      content: 'Создайте простой калькулятор с базовыми операциями',
      type: 'TASK',
      deadline: '2024-12-31T23:59:00Z',
      author: {
        id: 'mock-teacher-1',
        username: 'teacher1',
        displayName: 'Преподаватель Иванов',
        createdAt: '2024-01-10T10:00:00Z'
      },
      materialsCount: 0,
      commentsCount: 3,
      solutionsCount: 12,
      mySolutionId: 'mock-solution-1',
      createdAt: '2024-01-25T10:00:00Z',
      updatedAt: '2024-01-25T10:00:00Z'
    },
    {
      id: 'mock-post-3',
      title: 'Функции и области видимости',
      content: 'Разберем работу функций, замыканий и областей видимости в JavaScript',
      type: 'MATERIAL',
      deadline: null,
      author: {
        id: 'mock-teacher-1',
        username: 'teacher1',
        displayName: 'Преподаватель Иванов',
        createdAt: '2024-01-10T10:00:00Z'
      },
      materialsCount: 1,
      commentsCount: 2,
      solutionsCount: 0,
      mySolutionId: null,
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z'
    }
  ],
  'mock-course-2': [
    {
      id: 'mock-post-4',
      title: 'Компоненты React',
      content: 'Изучение создания и использования React компонентов',
      type: 'MATERIAL',
      deadline: null,
      author: {
        id: 'mock-teacher-2',
        username: 'teacher2',
        displayName: 'Преподаватель Петрова',
        createdAt: '2024-01-25T10:00:00Z'
      },
      materialsCount: 3,
      commentsCount: 8,
      solutionsCount: 0,
      mySolutionId: null,
      createdAt: '2024-02-05T10:00:00Z',
      updatedAt: '2024-02-05T10:00:00Z'
    },
    {
      id: 'mock-post-5',
      title: 'Задание: TODO приложение',
      content: 'Создайте TODO приложение с использованием React Hooks',
      type: 'TASK',
      deadline: '2025-01-15T23:59:00Z',
      author: {
        id: 'mock-teacher-2',
        username: 'teacher2',
        displayName: 'Преподаватель Петрова',
        createdAt: '2024-01-25T10:00:00Z'
      },
      materialsCount: 1,
      commentsCount: 4,
      solutionsCount: 18,
      mySolutionId: 'mock-solution-2',
      createdAt: '2024-02-10T10:00:00Z',
      updatedAt: '2024-02-10T10:00:00Z'
    }
  ],
  'mock-course-3': [
    {
      id: 'mock-post-6',
      title: 'SQL запросы',
      content: 'Основные SQL команды: SELECT, INSERT, UPDATE, DELETE',
      type: 'MATERIAL',
      deadline: null,
      author: {
        id: 'mock-teacher-1',
        username: 'teacher1',
        displayName: 'Преподаватель Иванов',
        createdAt: '2024-01-10T10:00:00Z'
      },
      materialsCount: 2,
      commentsCount: 6,
      solutionsCount: 0,
      mySolutionId: null,
      createdAt: '2024-03-05T10:00:00Z',
      updatedAt: '2024-03-05T10:00:00Z'
    }
  ]
};

export const mockSolutions: Record<string, SolutionDto[]> = {
  'mock-post-2': [
    {
      id: 'mock-solution-1',
      text: 'Выполнил задание. Калькулятор поддерживает все базовые операции: сложение, вычитание, умножение и деление. Добавил обработку деления на ноль.',
      status: 'GRADED',
      grade: 95,
      filesCount: 2,
      submittedAt: '2024-01-28T15:30:00Z',
      updatedAt: '2024-01-28T15:30:00Z',
      gradedAt: '2024-01-29T10:00:00Z',
      student: {
        id: 'mock-student-1',
        username: 'student1',
        displayName: 'Иван Петров',
        createdAt: '2024-01-16T10:00:00Z'
      }
    },
    {
      id: 'mock-solution-3',
      text: 'Калькулятор готов. Реализованы все требуемые операции.',
      status: 'SUBMITTED',
      grade: null,
      filesCount: 1,
      submittedAt: '2024-01-30T12:00:00Z',
      updatedAt: '2024-01-30T12:00:00Z',
      gradedAt: null,
      student: {
        id: 'mock-student-2',
        username: 'student2',
        displayName: 'Мария Сидорова',
        createdAt: '2024-01-16T11:00:00Z'
      }
    }
  ],
  'mock-post-5': [
    {
      id: 'mock-solution-2',
      text: 'TODO приложение создано с использованием useState и useEffect. Реализованы функции добавления, удаления и отметки задач как выполненных.',
      status: 'GRADED',
      grade: 88,
      filesCount: 1,
      submittedAt: '2024-02-15T18:00:00Z',
      updatedAt: '2024-02-15T18:00:00Z',
      gradedAt: '2024-02-16T14:00:00Z',
      student: {
        id: 'mock-student-1',
        username: 'student1',
        displayName: 'Иван Петров',
        createdAt: '2024-01-16T10:00:00Z'
      }
    }
  ]
};

export const mockMembers: Record<string, MemberDto[]> = {
  'mock-course-1': [
    {
      user: {
        id: 'mock-teacher-1',
        username: 'teacher1',
        displayName: 'Преподаватель Иванов',
        createdAt: '2024-01-10T10:00:00Z'
      },
      role: 'TEACHER',
      joinedAt: '2024-01-15T10:00:00Z'
    },
    {
      user: {
        id: 'mock-student-1',
        username: 'student1',
        displayName: 'Иван Петров',
        createdAt: '2024-01-16T10:00:00Z'
      },
      role: 'STUDENT',
      joinedAt: '2024-01-16T11:00:00Z'
    },
    {
      user: {
        id: 'mock-student-2',
        username: 'student2',
        displayName: 'Мария Сидорова',
        createdAt: '2024-01-16T11:00:00Z'
      },
      role: 'STUDENT',
      joinedAt: '2024-01-16T12:00:00Z'
    }
  ],
  'mock-course-2': [
    {
      user: {
        id: 'mock-teacher-2',
        username: 'teacher2',
        displayName: 'Преподаватель Петрова',
        createdAt: '2024-01-25T10:00:00Z'
      },
      role: 'TEACHER',
      joinedAt: '2024-02-01T10:00:00Z'
    },
    {
      user: {
        id: 'mock-student-1',
        username: 'student1',
        displayName: 'Иван Петров',
        createdAt: '2024-01-16T10:00:00Z'
      },
      role: 'STUDENT',
      joinedAt: '2024-02-02T10:00:00Z'
    }
  ],
  'mock-course-3': [
    {
      user: {
        id: 'mock-teacher-1',
        username: 'teacher1',
        displayName: 'Преподаватель Иванов',
        createdAt: '2024-01-10T10:00:00Z'
      },
      role: 'TEACHER',
      joinedAt: '2024-03-01T10:00:00Z'
    }
  ]
};

export const getMySolution = (postId: string): SolutionDto | null => {
  const solutions = mockSolutions[postId] || [];
  return solutions.length > 0 ? solutions[0] : null;
};
