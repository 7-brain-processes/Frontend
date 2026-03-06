// ТЕСТЫ ДЛЯ ПРЕПОДАВАТЕЛЯ

describe('UI-tests (Teacher)', () => {
    beforeEach(() => {
        // cy.visit('http://localhost:4173/#/');
        // cy.viewport(1280, 768);
        // Предполагается, что преподаватель уже авторизован
    });

    // Создание поста-материала
    const testMaterialData = [
        {
            title: 'Английский: Английский, Английский', // 1-300
            content: 'Выучить: выучить, выучить' // 0-10000
        }
    ];
    describe('создание поста-материала', () => {
        testMaterialData.forEach(({ title, content }) => {
            it('test', () => {
                // Открыта страница курса
                // cy.get();

                // Нажимаем на кнопку создания поста
                cy.get('button').contains('Создать пост').click();

                // Открывается модальное окно
                cy.get('[role="dialog"]').should('be.visible');

                // Выбираем тип "Материал"
                cy.get('[role="dialog"]').contains('Материал').click();

                // Заполняем поля
                if (title !== "") cy.get('input[placeholder="Введите название"]').type(title);
                if (content !== "") cy.get('textarea[placeholder="Описание"]').type(content);

                // Создаем пост
                cy.get('[role="dialog"]').contains('Создать').click();

                // Окно закрывается
                cy.get('[role="dialog"]').should('not.exist');

                // Проверяем, что пост появился в списке
                cy.contains(title).should('be.visible');
            });
        });
    });

    // Создание поста-материала с пустыми полями
    describe('создание поста-материала (валидация пустых полей)', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Нажимаем на кнопку создания поста
            cy.get('button').contains('Создать пост').click();

            // Открывается модальное окно
            cy.get('[role="dialog"]').should('be.visible');

            // Не заполняем поля и пытаемся создать
            cy.get('[role="dialog"]').contains('Создать').click();

            // Проверка на наличие предупреждения
            cy.get('[data-slot="form-message"]')
                .should('be.visible')
                .and('contain.text', 'Поле должно быть заполнено');
        });
    });

    // Создание задания с дедлайном
    const testTaskData = [
        {
            title: 'Пересказ текста', // 1-300
            content: 'Перескажите текст', // 0-10000
            deadline: '2026-12-31T23:59:59'
        }
    ];
    describe('создание задания с дедлайном', () => {
        testTaskData.forEach(({ title, content, deadline }) => {
            it('test', () => {
                // Открыта страница курса
                // cy.get();

                // Нажимаем на кнопку создания поста
                cy.get('button').contains('Создать пост').click();

                // Открывается модальное окно
                cy.get('[role="dialog"]').should('be.visible');

                // Выбираем тип "Задание"
                cy.get('[role="dialog"]').contains('Задание').click();

                // Заполняем поля
                if (title !== "") cy.get('input[placeholder="Введите название"]').type(title);
                if (content !== "") cy.get('textarea[placeholder="Описание"]').type(content);
                if (deadline !== "") cy.get('input[type="datetime-local"]').type(deadline);

                // Создаем задание
                cy.get('[role="dialog"]').contains('Создать').click();

                // Окно закрывается
                cy.get('[role="dialog"]').should('not.exist');

                // Проверяем, что задание появилось
                cy.contains(title).should('be.visible');
            });
        });
    });

    // Редактирование поста
    describe('редактирование поста', () => {
        it('test', () => {
            // Открыта страница курса с постами
            // cy.get();

            // Кликаем на конкретный пост
            cy.get('[data-testid="post-item"]').first().click();

            // Открывается страница поста
            // Нажимаем на кнопку редактирования
            cy.get('button').contains('Редактировать').click();

            // Открывается модальное окно
            cy.get('[role="dialog"]').should('be.visible');

            // Изменяем название
            cy.get('input[placeholder="Введите название"]').clear().type('Обновленное название');

            // Сохраняем
            cy.get('[role="dialog"]').contains('Сохранить').click();

            // Окно закрывается
            cy.get('[role="dialog"]').should('not.exist');

            // Проверяем, что изменения применились
            cy.contains('Обновленное название').should('be.visible');
        });
    });

    // Удаление поста
    describe('удаление поста', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Кликаем на конкретный пост
            cy.get('[data-testid="post-item"]').first().click();

            // Нажимаем на кнопку удаления
            cy.get('button').contains('Удалить пост').click();

            // Подтверждаем удаление
            cy.get('[role="dialog"]').contains('Подтвердить').click();

            // Проверяем, что поста больше нет
            // cy.get('[data-testid="post-item"]').should('not.exist');
        });
    });

    // Создание кода приглашения для студента
    describe('создание кода приглашения (студент)', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в настройки или раздел приглашений
            cy.get('button').contains('Пригласить').click();

            // Открывается модальное окно
            cy.get('[role="dialog"]').should('be.visible');

            // Выбираем роль "Студент"
            cy.get('[role="dialog"]').contains('Студент').click();

            // Создаем код
            cy.get('[role="dialog"]').contains('Создать код').click();

            // Проверяем, что код появился
            cy.get('[data-testid="invite-code"]').should('be.visible');
        });
    });

    // Создание кода приглашения для преподавателя
    describe('создание кода приглашения (преподаватель)', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в раздел приглашений
            cy.get('button').contains('Пригласить').click();

            // Открывается модальное окно
            cy.get('[role="dialog"]').should('be.visible');

            // Выбираем роль "Преподаватель"
            cy.get('[role="dialog"]').contains('Преподаватель').click();

            // Создаем код
            cy.get('[role="dialog"]').contains('Создать код').click();

            // Проверяем, что код появился
            cy.get('[data-testid="invite-code"]').should('be.visible');
        });
    });

    // Просмотр списка решений студентов
    describe('просмотр списка решений студентов', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Кликаем на задание
            cy.contains('Задание').click();

            // Открывается страница задания
            // Переходим в раздел решений
            cy.get('button').contains('Решения').click();

            // Проверяем, что список решений загрузился
            cy.get('[data-testid="solutions-list"]').should('be.visible');
        });
    });

    // Выставление оценки за решение
    const testGradeData = [
        {
            grade: 85, // 0-100
            comment: 'Нормально'
        }
    ];
    describe('выставление оценки за решение', () => {
        testGradeData.forEach(({ grade, comment }) => {
            it('test', () => {
                // Открыта страница с решениями
                // cy.get();

                // Кликаем на конкретное решение студента
                cy.get('[data-testid="solution-item"]').first().click();

                // Открывается страница решения
                // Нажимаем на кнопку оценивания
                cy.get('button').contains('Оценить').click();

                // Открывается модальное окно
                cy.get('[role="dialog"]').should('be.visible');

                // Вводим оценку
                if (grade !== null) cy.get('input[type="number"]').type(grade.toString());
                if (comment !== "") cy.get('textarea[placeholder="Комментарий"]').type(comment);

                // Сохраняем оценку
                cy.get('[role="dialog"]').contains('Сохранить').click();

                // Окно закрывается
                cy.get('[role="dialog"]').should('not.exist');

                // Проверяем, что оценка отображается
                cy.contains(grade.toString()).should('be.visible');
            });
        });
    });

    // Оставить комментарий к решению студента
    const testSolutionCommentData = [
        {
            text: 'Выучи текст' // 1-5000
        }
    ];
    describe('оставить комментарий к решению студента', () => {
        testSolutionCommentData.forEach(({ text }) => {
            it('test', () => {
                // Открыта страница решения студента
                // cy.get();

                // Находим поле для комментария
                cy.get('textarea[placeholder="Добавить комментарий"]').type(text);

                // Отправляем комментарий
                cy.get('button').contains('Отправить').click();

                // Проверяем, что комментарий появился
                cy.contains(text).should('be.visible');
            });
        });
    });

    // Проверка валидации пустого комментария к решению
    describe('оставить комментарий к решению (валидация)', () => {
        it('test', () => {
            // Открыта страница решения студента
            // cy.get();

            // Пытаемся отправить пустой комментарий
            cy.get('button').contains('Отправить').click();

            // Проверка на наличие предупреждения
            cy.get('[data-slot="form-message"]')
                .should('be.visible')
                .and('contain.text', 'Поле должно быть заполнено');
        });
    });

    // Загрузка файла-материала к посту
    describe('загрузка файла-материала к посту', () => {
        it('test', () => {
            // Открыта страница поста
            // cy.get();

            // Нажимаем на кнопку загрузки файла
            cy.get('button').contains('Прикрепить файл').click();

            // Загружаем файл (пример)
            // cy.get('input[type="file"]').attachFile('example.pdf');

            // Проверяем, что файл появился в списке
            // cy.get('[data-testid="material-file"]').should('be.visible');
        });
    });

    // Удаление студента из курса
    describe('удаление студента из курса', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в раздел участников
            cy.get('button').contains('Участники').click();

            // Находим студента в списке
            cy.get('[data-testid="member-item"]').first().within(() => {
                // Нажимаем на кнопку удаления
                cy.get('button').contains('Удалить').click();
            });

            // Подтверждаем удаление
            cy.get('[role="dialog"]').contains('Подтвердить').click();

            // Проверяем, что студента больше нет в списке
            // cy.get('[data-testid="member-item"]').should('have.length', 0);
        });
    });

    // Удаление курса
    describe('удаление курса', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в настройки курса
            cy.get('button').contains('Настройки').click();

            // Нажимаем на кнопку удаления курса
            cy.get('button').contains('Удалить курс').click();

            // Подтверждаем удаление
            cy.get('[role="dialog"]').should('be.visible');
            cy.get('[role="dialog"]').contains('Подтвердить').click();

            // Проверяем редирект на главную страницу
            // cy.url().should('include', '/');
        });
    });

    // Отзыв кода приглашения
    describe('отзыв кода приглашения', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в раздел приглашений
            cy.get('button').contains('Приглашения').click();

            // Находим код приглашения
            cy.get('[data-testid="invite-item"]').first().within(() => {
                // Нажимаем на кнопку отзыва
                cy.get('button').contains('Отозвать').click();
            });

            // Подтверждаем отзыв
            cy.get('[role="dialog"]').contains('Подтвердить').click();

            // Проверяем, что код удален или помечен как неактивный
            // cy.get('[data-testid="invite-item"]').should('not.exist');
        });
    });

    // Редактирование курса
    const testCourseUpdateData = [
        {
            name: 'Обновленное название курса', // 1-200
            description: 'Обновленное описание курса' // 0-2000
        }
    ];
    describe('редактирование курса', () => {
        testCourseUpdateData.forEach(({ name, description }) => {
            it('test', () => {
                // Открыта страница курса
                // cy.get();

                // Переходим в настройки
                cy.get('button').contains('Настройки').click();

                // Нажимаем на редактирование
                cy.get('button').contains('Редактировать').click();

                // Открывается модальное окно
                cy.get('[role="dialog"]').should('be.visible');

                // Изменяем данные
                if (name !== "") cy.get('input[placeholder="Введите название курса"]').clear().type(name);
                if (description !== "") cy.get('input[placeholder="Введите описание курса"]').clear().type(description);

                // Сохраняем
                cy.get('[role="dialog"]').contains('Сохранить').click();

                // Окно закрывается
                cy.get('[role="dialog"]').should('not.exist');

                // Проверяем, что изменения применились
                cy.contains(name).should('be.visible');
            });
        });
    });

    // Удаление материала (файла) из поста
    describe('удаление файла из поста', () => {
        it('test', () => {
            // Открыта страница поста с прикрепленным файлом
            // cy.get();

            // Находим файл в списке материалов
            cy.get('[data-testid="material-file"]').first().within(() => {
                // Нажимаем на кнопку удаления
                cy.get('button[aria-label="Удалить"]').click();
            });

            // Подтверждаем удаление
            cy.get('[role="dialog"]').contains('Подтвердить').click();

            // Проверяем, что файла больше нет
            // cy.get('[data-testid="material-file"]').should('not.exist');
        });
    });

    // Просмотр конкретного поста
    describe('просмотр конкретного поста', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Кликаем на пост в списке
            cy.get('[data-testid="post-item"]').first().click();

            // Проверяем, что открылась страница поста
            cy.get('[data-testid="post-detail"]').should('be.visible');

            // Проверяем наличие основных элементов
            cy.get('[data-testid="post-title"]').should('be.visible');
            cy.get('[data-testid="post-content"]').should('be.visible');
        });
    });

    // Просмотр списка материалов поста
    describe('просмотр списка материалов поста', () => {
        it('test', () => {
            // Открыта страница поста
            // cy.get();

            // Переходим к разделу материалов
            cy.get('[data-testid="materials-section"]').should('be.visible');

            // Проверяем список файлов
            cy.get('[data-testid="material-file"]').should('exist');
        });
    });

    // Скачивание материала поста
    describe('скачивание материала поста', () => {
        it('test', () => {
            // Открыта страница поста с материалами
            // cy.get();

            // Находим файл в списке
            cy.get('[data-testid="material-file"]').first().within(() => {
                // Нажимаем на кнопку скачивания
                cy.get('button[aria-label="Скачать"]').click();
            });

            // Проверяем, что началась загрузка
            // cy.readFile('cypress/downloads/filename.pdf').should('exist');
        });
    });

    // Просмотр списка всех приглашений курса
    describe('просмотр списка приглашений курса', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в раздел приглашений
            cy.get('button').contains('Приглашения').click();

            // Проверяем, что список загрузился
            cy.get('[data-testid="invites-list"]').should('be.visible');

            // Проверяем наличие информации о приглашениях
            cy.get('[data-testid="invite-item"]').should('exist');
        });
    });

    // Просмотр файлов в решении студента
    describe('просмотр файлов в решении студента', () => {
        it('test', () => {
            // Открыта страница решения студента
            // cy.get();

            // Переходим к разделу файлов
            cy.get('[data-testid="solution-files-section"]').should('be.visible');

            // Проверяем список файлов
            cy.get('[data-testid="solution-file"]').should('exist');
        });
    });

    // Скачивание файла из решения студента
    describe('скачивание файла из решения студента', () => {
        it('test', () => {
            // Открыта страница решения студента
            // cy.get();

            // Находим файл в списке
            cy.get('[data-testid="solution-file"]').first().within(() => {
                // Нажимаем на кнопку скачивания
                cy.get('button[aria-label="Скачать"]').click();
            });

            // Проверяем, что началась загрузка
            // cy.readFile('cypress/downloads/solution-file.pdf').should('exist');
        });
    });

    // Просмотр комментариев к решению студента
    describe('просмотр комментариев к решению студента', () => {
        it('test', () => {
            // Открыта страница решения студента
            // cy.get();

            // Переходим к разделу комментариев
            cy.get('[data-testid="solution-comments-section"]').should('be.visible');

            // Проверяем список комментариев
            cy.get('[data-testid="comment-item"]').should('exist');
        });
    });

    // Редактирование комментария к решению студента
    describe('редактирование комментария к решению', () => {
        it('test', () => {
            // Открыта страница решения с комментариями
            // cy.get();

            // Находим свой комментарий
            cy.get('[data-testid="comment-item"]').first().within(() => {
                // Нажимаем на кнопку редактирования
                cy.get('button[aria-label="Редактировать"]').click();
            });

            // Редактируем текст
            cy.get('textarea').clear().type('Обновленный комментарий преподавателя');

            // Сохраняем изменения
            cy.get('button').contains('Сохранить').click();

            // Проверяем, что комментарий обновился
            cy.contains('Обновленный комментарий преподавателя').should('be.visible');
        });
    });

    // Удаление комментария к решению студента
    describe('удаление комментария к решению', () => {
        it('test', () => {
            // Открыта страница решения с комментариями
            // cy.get();

            // Находим комментарий
            cy.get('[data-testid="comment-item"]').first().within(() => {
                // Нажимаем на кнопку удаления
                cy.get('button[aria-label="Удалить"]').click();
            });

            // Подтверждаем удаление
            cy.get('[role="dialog"]').contains('Подтвердить').click();

            // Проверяем, что комментарий удален
            // cy.get('[data-testid="comment-item"]').should('not.exist');
        });
    });

    // Редактирование собственного комментария к посту
    describe('редактирование собственного комментария к посту', () => {
        it('test', () => {
            // Открыта страница поста с комментариями
            // cy.get();

            // Находим свой комментарий в публичных комментариях
            cy.get('[data-testid="post-comment"]').first().within(() => {
                // Нажимаем на кнопку редактирования
                cy.get('button[aria-label="Редактировать"]').click();
            });

            // Изменяем текст комментария
            cy.get('textarea').clear().type('Обновленный публичный комментарий');

            // Сохраняем
            cy.get('button').contains('Сохранить').click();

            // Проверяем, что изменения применились
            cy.contains('Обновленный публичный комментарий').should('be.visible');
        });
    });

    // Удаление любого комментария к посту (преподаватель может удалять любые)
    describe('удаление комментария к посту', () => {
        it('test', () => {
            // Открыта страница поста с комментариями
            // cy.get();

            // Находим комментарий (любой, т.к. преподаватель может удалять любые)
            cy.get('[data-testid="post-comment"]').first().within(() => {
                // Нажимаем на кнопку удаления
                cy.get('button[aria-label="Удалить"]').click();
            });

            // Подтверждаем удаление
            cy.get('[role="dialog"]').contains('Подтвердить').click();

            // Проверяем, что комментарий удален
            // cy.get('[data-testid="post-comment"]').first().should('not.exist');
        });
    });

    // Просмотр списка участников курса с фильтрацией
    describe('просмотр участников курса с фильтрацией', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в раздел участников
            cy.get('button').contains('Участники').click();

            // Проверяем, что список загрузился
            cy.get('[data-testid="members-list"]').should('be.visible');

            // Фильтруем по роли "Студенты"
            cy.get('select[name="role-filter"]').select('STUDENT');

            // Проверяем, что отображаются только студенты
            cy.get('[data-testid="member-item"]').each(($el) => {
                cy.wrap($el).should('contain', 'Студент');
            });

            // Фильтруем по роли "Преподаватели"
            cy.get('select[name="role-filter"]').select('TEACHER');

            // Проверяем, что отображаются только преподаватели
            cy.get('[data-testid="member-item"]').each(($el) => {
                cy.wrap($el).should('contain', 'Преподаватель');
            });
        });
    });

    // Просмотр решений с фильтрацией по статусу
    describe('просмотр решений с фильтрацией по статусу', () => {
        it('test', () => {
            // Открыта страница задания
            // cy.get();

            // Переходим к разделу решений
            cy.get('button').contains('Решения').click();

            // Фильтруем по статусу "Отправлено"
            cy.get('select[name="status-filter"]').select('SUBMITTED');

            // Проверяем, что отображаются только неоцененные решения
            cy.get('[data-testid="solution-item"]').each(($el) => {
                cy.wrap($el).should('contain', 'Отправлено');
            });

            // Фильтруем по статусу "Оценено"
            cy.get('select[name="status-filter"]').select('GRADED');

            // Проверяем, что отображаются только оцененные решения
            cy.get('[data-testid="solution-item"]').each(($el) => {
                cy.wrap($el).should('contain', 'Оценено');
            });
        });
    });

    // Просмотр постов с фильтрацией по типу
    describe('просмотр постов с фильтрацией по типу', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Фильтруем по типу "Материалы"
            cy.get('select[name="type-filter"]').select('MATERIAL');

            // Проверяем, что отображаются только материалы
            cy.get('[data-testid="post-item"]').each(($el) => {
                cy.wrap($el).should('contain', 'Материал');
            });

            // Фильтруем по типу "Задания"
            cy.get('select[name="type-filter"]').select('TASK');

            // Проверяем, что отображаются только задания
            cy.get('[data-testid="post-item"]').each(($el) => {
                cy.wrap($el).should('contain', 'Задание');
            });
        });
    });

    // Просмотр списка всех курсов преподавателя
    describe('просмотр списка всех курсов', () => {
        it('test', () => {
            // Открыта главная страница
            // cy.get();

            // Проверяем, что список курсов загрузился
            cy.get('[data-testid="courses-list"]').should('be.visible');

            // Проверяем наличие курсов
            cy.get('[data-testid="course-item"]').should('have.length.greaterThan', 0);

            // Проверяем, что у каждого курса есть название
            cy.get('[data-testid="course-item"]').each(($el) => {
                cy.wrap($el).find('[data-testid="course-title"]').should('be.visible');
            });
        });
    });

    // Просмотр списка курсов с фильтрацией по роли
    describe('просмотр курсов с фильтрацией по роли', () => {
        it('test', () => {
            // Открыта главная страница
            // cy.get();

            // Фильтруем по роли "Преподаватель"
            cy.get('select[name="role-filter"]').select('TEACHER');

            // Проверяем, что отображаются только курсы где я преподаватель
            cy.get('[data-testid="course-item"]').should('exist');

            // Сбрасываем фильтр - показываем все курсы
            cy.get('select[name="role-filter"]').select('ALL');

            // Проверяем, что отображаются все курсы
            cy.get('[data-testid="course-item"]').should('exist');
        });
    });

    // Просмотр деталей конкретного курса
    describe('просмотр деталей курса', () => {
        it('test', () => {
            // Открыта главная страница
            // cy.get();

            // Кликаем на курс
            cy.get('[data-testid="course-item"]').first().click();

            // Проверяем, что открылась страница курса
            cy.get('[data-testid="course-detail"]').should('be.visible');

            // Проверяем наличие основной информации
            cy.get('[data-testid="course-title"]').should('be.visible');
            cy.get('[data-testid="course-description"]').should('be.visible');

            // Проверяем наличие кнопок управления для преподавателя
            cy.get('button').contains('Создать пост').should('be.visible');
            cy.get('button').contains('Настройки').should('be.visible');
        });
    });

    // Просмотр списка постов курса
    describe('просмотр списка постов курса', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Проверяем, что список постов загрузился
            cy.get('[data-testid="posts-list"]').should('be.visible');

            // Проверяем наличие постов
            cy.get('[data-testid="post-item"]').should('exist');

            // Проверяем, что у каждого поста есть заголовок и тип
            cy.get('[data-testid="post-item"]').first().within(() => {
                cy.get('[data-testid="post-title"]').should('be.visible');
                cy.get('[data-testid="post-type"]').should('be.visible');
            });
        });
    });

    // Просмотр списка постов с пагинацией
    describe('просмотр постов с пагинацией', () => {
        it('test', () => {
            // Открыта страница курса с большим количеством постов
            // cy.get();

            // Проверяем первую страницу
            cy.get('[data-testid="posts-list"]').should('be.visible');

            // Переходим на следующую страницу
            cy.get('button[aria-label="Следующая страница"]').click();

            // Проверяем, что контент обновился
            cy.get('[data-testid="posts-list"]').should('be.visible');

            // Возвращаемся на предыдущую страницу
            cy.get('button[aria-label="Предыдущая страница"]').click();

            // Проверяем, что вернулись на первую страницу
            cy.get('[data-testid="posts-list"]').should('be.visible');
        });
    });

    // Просмотр комментариев к посту
    describe('просмотр комментариев к посту', () => {
        it('test', () => {
            // Открыта страница поста
            // cy.get();

            // Переходим к разделу комментариев
            cy.get('[data-testid="post-comments-section"]').should('be.visible');

            // Проверяем список комментариев
            cy.get('[data-testid="post-comment"]').should('exist');

            // Проверяем структуру комментария
            cy.get('[data-testid="post-comment"]').first().within(() => {
                cy.get('[data-testid="comment-author"]').should('be.visible');
                cy.get('[data-testid="comment-text"]').should('be.visible');
                cy.get('[data-testid="comment-date"]').should('be.visible');
            });
        });
    });

    // Просмотр комментариев с пагинацией
    describe('просмотр комментариев к посту с пагинацией', () => {
        it('test', () => {
            // Открыта страница поста с большим количеством комментариев
            // cy.get();

            // Проверяем список комментариев
            cy.get('[data-testid="post-comments-section"]').should('be.visible');

            // Проверяем кнопку "Загрузить еще"
            cy.get('button').contains('Загрузить еще').should('be.visible').click();

            // Проверяем, что комментарии догрузились
            cy.get('[data-testid="post-comment"]').should('have.length.greaterThan', 0);
        });
    });

    // Просмотр конкретного решения студента
    describe('просмотр конкретного решения студента', () => {
        it('test', () => {
            // Открыта страница задания
            // cy.get();

            // Переходим к решениям
            cy.get('button').contains('Решения').click();

            // Кликаем на конкретное решение
            cy.get('[data-testid="solution-item"]').first().click();

            // Проверяем, что открылась страница решения
            cy.get('[data-testid="solution-detail"]').should('be.visible');

            // Проверяем основные элементы
            cy.get('[data-testid="solution-author"]').should('be.visible');
            cy.get('[data-testid="solution-content"]').should('be.visible');
            cy.get('[data-testid="solution-status"]').should('be.visible');

            // Проверяем наличие кнопки оценить (если еще не оценено)
            cy.get('button').contains('Оценить').should('exist');
        });
    });

    // Просмотр участников с пагинацией
    describe('просмотр участников курса с пагинацией', () => {
        it('test', () => {
            // Открыта страница курса
            // cy.get();

            // Переходим в раздел участников
            cy.get('button').contains('Участники').click();

            // Проверяем первую страницу
            cy.get('[data-testid="members-list"]').should('be.visible');

            // Если есть пагинация, переходим на следующую страницу
            cy.get('button[aria-label="Следующая страница"]').then(($btn) => {
                if ($btn.is(':visible') && !$btn.is(':disabled')) {
                    cy.wrap($btn).click();
                    // Проверяем, что список обновился
                    cy.get('[data-testid="members-list"]').should('be.visible');
                }
            });
        });
    });

    // Просмотр решений с пагинацией
    describe('просмотр решений студентов с пагинацией', () => {
        it('test', () => {
            // Открыта страница задания
            // cy.get();

            // Переходим к решениям
            cy.get('button').contains('Решения').click();

            // Проверяем первую страницу решений
            cy.get('[data-testid="solutions-list"]').should('be.visible');

            // Переходим на следующую страницу
            cy.get('button[aria-label="Следующая страница"]').then(($btn) => {
                if ($btn.is(':visible') && !$btn.is(':disabled')) {
                    cy.wrap($btn).click();
                    // Проверяем, что список обновился
                    cy.get('[data-testid="solutions-list"]').should('be.visible');
                }
            });
        });
    });

});
