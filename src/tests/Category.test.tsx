import { categoryService } from "../api/category";
import {
  loadCategoriesFunc,
  handleSaveCategoryFunc,
  handleDeleteCategoryFunc,
  loadMyCategoryFunc,
  deleteMyCategoryFunc,
  chooseMyCategoryFunc
} from "../components/course/CategoryTab/hooks/useCategoryTab";

jest.mock('../api/services', () => ({
  categoryService: {
    createCategory: jest.fn(),
    listCategories: jest.fn(),
    deleteCategory: jest.fn(),
    updateCategory: jest.fn(),
    getMyCategory: jest.fn(),
    setMyCategory: jest.fn(),
  },
  joinCourse: jest.fn(),
  membersService: {
    listMembers: jest.fn(),
  },
}));

describe('Тестирование категорий', () => {
  const mockedCategoryService = categoryService as jest.Mocked<typeof categoryService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (window.alert as jest.Mock).mockReset();
    (window.confirm as jest.Mock).mockReset();
  });

  test('Успешная загрузка категорий', async () => {
    const setCategoriesMock = jest.fn();
    const mockResponse =
      [
        {
          id: '1',
          title: 'title',
          description: 'description',
          active: true,
          createdAt: new Date()
        },
      ];

    mockedCategoryService.listCategories.mockResolvedValue(mockResponse);

    await loadCategoriesFunc('courseId', setCategoriesMock);

    expect(mockedCategoryService.listCategories).toHaveBeenCalledWith('courseId');
    expect(setCategoriesMock).toHaveBeenCalledWith(mockResponse);
  });

  test('Ошибка при загрузке категорий', async () => {
    const setCategoriesMock = jest.fn();
    mockedCategoryService.listCategories.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => { });

    await loadCategoriesFunc('courseId', setCategoriesMock);

    expect(mockedCategoryService.listCategories).toHaveBeenCalled();
    expect(setCategoriesMock).toHaveBeenCalledWith([]);
    expect(window.alert).toHaveBeenCalledWith('Ошибка загрузки категорий');
  });

  test('Не найден id курса при загрузке категорий', async () => {
    const setCategoriesMock = jest.fn();
    const result = await loadCategoriesFunc(undefined, setCategoriesMock);

    expect(result).toBe(false);
    expect(mockedCategoryService.listCategories).not.toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  test('Успешная загрузка моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    const mockResponse =
    {
      id: '1',
      title: 'title',
      description: 'description',
      active: true,
      createdAt: new Date()
    };

    mockedCategoryService.getMyCategory.mockResolvedValue(mockResponse);

    await loadMyCategoryFunc('courseId', setMyCategoryMock);

    expect(mockedCategoryService.getMyCategory).toHaveBeenCalledWith('courseId');
    expect(setMyCategoryMock).toHaveBeenCalledWith(mockResponse);
  });

  test('Ошибка при загрузке моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    mockedCategoryService.getMyCategory.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => { });

    await loadMyCategoryFunc('courseId', setMyCategoryMock);

    expect(mockedCategoryService.getMyCategory).toHaveBeenCalled();
    expect(setMyCategoryMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Ошибка загрузки категории');
  });

  test('Не найден id курса при загрузке моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    const result = await loadMyCategoryFunc(undefined, setMyCategoryMock);

    expect(result).toBe(false);
    expect(mockedCategoryService.getMyCategory).not.toHaveBeenCalled();
    expect(setMyCategoryMock).not.toHaveBeenCalled();
  });

  test('Успешное удаление моей категории', async () => {
    const setMyCategoryMock = jest.fn();

    mockedCategoryService.setMyCategory.mockResolvedValue(null as any);

    await deleteMyCategoryFunc('courseId', setMyCategoryMock);

    expect(mockedCategoryService.setMyCategory).toHaveBeenCalledWith('courseId', { categotyId: null });
    expect(setMyCategoryMock).toHaveBeenCalled();
  });

  test('Ошибка при удалении моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    mockedCategoryService.setMyCategory.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => { });

    await deleteMyCategoryFunc('courseId', setMyCategoryMock);

    expect(mockedCategoryService.setMyCategory).toHaveBeenCalled();
    expect(setMyCategoryMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Ошибка удаления категории');
  });

  test('Не найден id курса при удалении моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    const result = await deleteMyCategoryFunc(undefined, setMyCategoryMock);

    expect(result).toBe(false);
    expect(mockedCategoryService.setMyCategory).not.toHaveBeenCalled();
    expect(setMyCategoryMock).not.toHaveBeenCalled();
  });

  test('Успешное удаление категории', async () => {
    const setCategoriesMock = jest.fn();
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];

    mockedCategoryService.deleteCategory.mockResolvedValue(null as any);

    await handleDeleteCategoryFunc('courseId', '1', setCategoriesMock, categories);

    expect(mockedCategoryService.deleteCategory).toHaveBeenCalledWith('courseId', '1');
    expect(setCategoriesMock).toHaveBeenCalled();
  });

  test('Ошибка при удалении категории', async () => {
    const setCategoriesMock = jest.fn();
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];

    mockedCategoryService.deleteCategory.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => { });

    await handleDeleteCategoryFunc('courseId', '1', setCategoriesMock, categories);

    expect(mockedCategoryService.deleteCategory).toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Ошибка удаления категории');
  });

  test('Не найден id курса при удалении категории', async () => {
    const setCategoriesMock = jest.fn();
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];

    const result = await handleDeleteCategoryFunc(undefined, 'categoryId', setCategoriesMock, categories);

    expect(result).toBe(false);
    expect(mockedCategoryService.deleteCategory).not.toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  test('Не найден id категории при удалении категории', async () => {
    const setCategoriesMock = jest.fn();
    const categories = [
      {
        id: '',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];

    const result = await handleDeleteCategoryFunc('courseId', undefined, setCategoriesMock, categories);

    expect(result).toBe(false);
    expect(mockedCategoryService.deleteCategory).not.toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  test('Успешный выбор моей категории', async () => {
    const setMyCategoryMock = jest.fn();

    mockedCategoryService.setMyCategory.mockResolvedValue(null as any);

    await chooseMyCategoryFunc('courseId', 'categoryId', setMyCategoryMock);

    expect(mockedCategoryService.setMyCategory).toHaveBeenCalledWith('courseId', { categotyId: 'categoryId' });
    expect(setMyCategoryMock).toHaveBeenCalled();
  });

  test('Ошибка при выборе моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    mockedCategoryService.setMyCategory.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => { });

    await chooseMyCategoryFunc('courseId', 'categoryId', setMyCategoryMock);

    expect(mockedCategoryService.setMyCategory).toHaveBeenCalled();
    expect(setMyCategoryMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Ошибка выбора категории');
  });

  test('Не найден id курса при выборе моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    const result = await chooseMyCategoryFunc(undefined, 'categoryId', setMyCategoryMock);

    expect(result).toBe(false);
    expect(mockedCategoryService.setMyCategory).not.toHaveBeenCalled();
    expect(setMyCategoryMock).not.toHaveBeenCalled();
  });

  test('Не найден id категории при выборе моей категории', async () => {
    const setMyCategoryMock = jest.fn();
    const result = await chooseMyCategoryFunc('courseId', undefined, setMyCategoryMock);

    expect(result).toBe(false);
    expect(mockedCategoryService.setMyCategory).not.toHaveBeenCalled();
    expect(setMyCategoryMock).not.toHaveBeenCalled();
  });

  test('Успешное создание категории', async () => {
    const setCategoriesMock = jest.fn();
    const setShowCreateCategoryMock = jest.fn();
    const mockResponse =
    {
      id: '3',
      title: 'title3',
      description: 'description3',
      active: true,
      createdAt: new Date()
    };
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];
    const categoryForm =
    {
      title: 'title',
      description: '',
      active: true
    };
    const editingCategory = null;

    mockedCategoryService.createCategory.mockResolvedValue(mockResponse);

    const result = await handleSaveCategoryFunc(categoryForm, editingCategory, 'courseId', setCategoriesMock, categories, setShowCreateCategoryMock);

    expect(mockedCategoryService.createCategory).toHaveBeenCalled();
    expect(setCategoriesMock).toHaveBeenCalledWith([mockResponse]);
    expect(setShowCreateCategoryMock).toHaveBeenCalledWith(false);
  });

  test('Успешное редактирование категории', async () => {
    const setCategoriesMock = jest.fn();
    const setShowCreateCategoryMock = jest.fn();
    const mockResponse =
    {
      id: '2',
      title: 'title3',
      description: 'description3',
      active: true,
      createdAt: new Date()
    };
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];
    const categoryForm =
    {
      title: 'title2',
      description: 'description2',
      active: true
    };
    const editingCategory =
    {
      id: '2',
      title: 'title',
      description: 'description',
      active: true,
      createdAt: new Date()
    };

    mockedCategoryService.updateCategory.mockResolvedValue(mockResponse);
    const result = await handleSaveCategoryFunc(categoryForm, editingCategory, 'courseId', setCategoriesMock, categories, setShowCreateCategoryMock);

    expect(mockedCategoryService.updateCategory).toHaveBeenCalled();
    expect(setCategoriesMock).toHaveBeenCalled();
    expect(setShowCreateCategoryMock).toHaveBeenCalledWith(false);
  });

  test('Не прошла валидация при создании/редактировании категории', async () => {
    const setCategoriesMock = jest.fn();
    const setShowCreateCategoryMock = jest.fn();
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];
    const categoryForm =
    {
      title: '',
      description: '',
      active: true
    };
    const editingCategory = null;

    const result = await handleSaveCategoryFunc(categoryForm, editingCategory, 'courseId', setCategoriesMock, categories, setShowCreateCategoryMock);

    expect(result).toBe(false);
    expect(mockedCategoryService.updateCategory).not.toHaveBeenCalled();
    expect(mockedCategoryService.createCategory).not.toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
  });

  test('Ошибка при создании категории', async () => {
    const setCategoriesMock = jest.fn();
    const setShowCreateCategoryMock = jest.fn();
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];
    const categoryForm =
    {
      title: 'title',
      description: '',
      active: true
    };
    const editingCategory = null;
    mockedCategoryService.updateCategory.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => { });

    const result = await handleSaveCategoryFunc(categoryForm, editingCategory, 'courseId', setCategoriesMock, categories, setShowCreateCategoryMock);

    expect(mockedCategoryService.createCategory).toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Ошибка сохранения категории');
  });

  test('Ошибка при изменении категории', async () => {
    const setCategoriesMock = jest.fn();
    const setShowCreateCategoryMock = jest.fn();
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];
    const categoryForm =
    {
      title: 'title',
      description: '',
      active: true
    };
    const editingCategory =
    {
      id: '1',
      title: 'title',
      description: 'description',
      active: true,
      createdAt: new Date()
    };
    mockedCategoryService.updateCategory.mockRejectedValue(new Error('Ошибка сервера'));
    jest.spyOn(console, 'error').mockImplementation(() => { });

    const result = await handleSaveCategoryFunc(categoryForm, editingCategory, 'courseId', setCategoriesMock, categories, setShowCreateCategoryMock);

    expect(mockedCategoryService.createCategory).toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Ошибка сохранения категории');
  });

  test('Не найден id курса при создании/изменении категории', async () => {
    const setCategoriesMock = jest.fn();
    const setShowCreateCategoryMock = jest.fn();
    const categories = [
      {
        id: '1',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'title',
        description: 'description',
        active: true,
        createdAt: new Date()
      }
    ];
    const categoryForm =
    {
      title: '',
      description: '',
      active: true
    };
    const editingCategory = null;

    const result = await handleSaveCategoryFunc(categoryForm, editingCategory, undefined, setCategoriesMock, categories, setShowCreateCategoryMock);

    expect(result).toBe(false);
    expect(mockedCategoryService.updateCategory).not.toHaveBeenCalled();
    expect(mockedCategoryService.createCategory).not.toHaveBeenCalled();
    expect(setCategoriesMock).not.toHaveBeenCalled();
  });
})