import type { Interception } from 'cypress/types/net-stubbing';

describe('UI-tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/#/');
    });

    describe(`Проверка входа при пустых полях`, () => {
        it('Выдает предупреждение', () => {
            // Авторизация
            cy.get('#login-button').click();

            // Проверка на наличие предупреждения
            cy.get('#username-error', { timeout: 5000 })
                .should('be.visible')
                .and('contain.text', 'Поле обязательно.');
        });
    });

    const testLoginData = [
        {
            username: 'username',
            password: 'password123'
        }
    ];
    describe(`Проверка входа`, () => {
        testLoginData.forEach(({ username, password }) => {
            it('Проверка данных пользователя при авторизации', () => {

                // Ввод данных в форму
                if (username !== "") cy.get('[data-testid="username-input"]').type(username);
                if (password !== "") cy.get('[data-testid="password-input"]').type(password);

                // Авторизация
                cy.get('#login-button').click();

                // Проверяем, что перешли на главную страницу
                cy.url().should('include', '/main')
            })
        })
    })

    describe(`Проверка регистрации при пустых полях`, () => {
        it('Выдает предупреждение', () => {
            // Регистрация
            cy.get('#register-button').click();

            // Проверка на наличие предупреждения
            cy.get('[data-slot="form-message"]')
                .should('be.visible')
                .and('contain.text', 'Поле обязательно.');
        });
    });

    const testRegistrationData = [
        {
            username: 'abс',
            password: 'password123',
            displayName: ''
        },
        {
            username: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            password: 'password123',
            displayName: 'displayName'
        }
    ];
    describe(`Проверка регистрации`, () => {
        testRegistrationData.forEach(({ username, password, displayName }) => {
            it('Проверка данных пользователя при регистрации', () => {

                // Ввод данных в форму
                if (username !== "") cy.get('[data-testid="username-input"]').type(username);
                if (password !== "") cy.get('[data-testid="password-input"]').type(password);
                if (displayName !== "") cy.get('[data-testid="displayName-input"]').type(displayName);

                // Регистрация
                cy.get('#register-button').click();

                // Проверяем, что перешли на главную страницу
                cy.url().should('include', '/main')
            })
        })
    })

    const testWrongRegistrationData = [
        {
            username: 'ab',
            password: 'password123',
            displayName: ''
        },
        {
            username: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            password: 'password123',
            displayName: ''
        }
    ];
    describe(`Проверка регистрации`, () => {
        testWrongRegistrationData.forEach(({ username, password, displayName }) => {
            it('Проверка неправильных данных пользователя при регистрации', () => {

                // Ввод данных в форму
                if (username !== "") cy.get('[data-testid="username-input"]').type(username);
                if (password !== "") cy.get('[data-testid="password-input"]').type(password);
                if (displayName !== "") cy.get('[data-testid="displayName-input"]').type(displayName);

                // Регистрация
                cy.get('#register-button').click();

                // Проверка на наличие предупреждения
                cy.get('[data-slot="form-message"]')
                    .should('be.visible')
                    .and('contain.text', 'Неправильная валидация.');
            })
        })
    })

    describe('Проверка создания курса при пустых полях', () => {
        it('Выдает предупреждение', () => {
            // Ввод данных в форму
            cy.get('[data-testid="username-input"]').type("");
            cy.get('[data-testid="password-input"]').type("");

            // Авторизация
            cy.get('#login-button').click();

            cy.get('a[href="#/main"]').click();

            cy.get('#createCourse-button').click();

            // Проверяем, что модальное окно открылось
            cy.get('[role="dialog"]').should('be.visible');

            // Создание курса
            cy.get('[role="dialog"]').contains('Создать').click();

            // Проверка на наличие предупреждения
            cy.get('[data-slot="form-message"]')
                .should('be.visible')
                .and('contain.text', 'Поле обязательно.');
        });
    });

    const testCreateCourseData = [
        {
            name: 'Базы данных',
            description: 'Курс для предмета базы данных'
        }
    ];
    describe('Проверка создания курса', () => {
        testCreateCourseData.forEach(({ name, description }) => {
            it('Проверка данных при создании курса', () => {
                // Ввод данных в форму
                cy.get('[data-testid="username-input"]').type("");
                cy.get('[data-testid="password-input"]').type("");

                // Авторизация
                cy.get('#login-button').click();

                cy.get('a[href="#/main"]').click();

                cy.get('#createCourse-button').click();

                // Проверяем, что модальное окно открылось
                cy.get('[role="dialog"]').should('be.visible');

                // Ввод данных в форму
                if (name !== "") cy.get('[data-testid="name-input"]').type(name);
                if (description !== "") cy.get('[data-testid="description-input"]').type(description);

                // Создание курса
                cy.get('[role="dialog"]').contains('Создать').click();

                // Проверяем, что модальное окно исчезло
                cy.get('[role="dialog"]').should('not.exist');

                // перенос в этот курсы
                // cy.url().should('include', '/main')
            });
        });
    });

    describe('Проверка присоединения к курсу при пустых полях', () => {
        it('Выдает предупреждение', () => {
            // Ввод данных в форму
            cy.get('[data-testid="username-input"]').type("");
            cy.get('[data-testid="password-input"]').type("");

            // Авторизация
            cy.get('#login-button').click();

            cy.get('a[href="#/main"]').click();

            cy.get('#joinCourse-button').click();

            // Проверяем, что модальное окно открылось
            cy.get('[role="dialog"]').should('be.visible');

            // Присоединение к курсу
            cy.get('[role="dialog"]').contains('Присоединиться').click();

            // Проверка на наличие предупреждения
            cy.get('[data-slot="form-message"]')
                .should('be.visible')
                .and('contain.text', 'Поле обязательно.');
        });
    });

    const testJoinCourseData = [
        {
            code: '123456'
        }
    ];
    describe('Проверка присоединения к курсу', () => {
        testJoinCourseData.forEach(({ code }) => {
            it('Проверка данных при присоединению к курсу', () => {
                // Ввод данных в форму
                cy.get('[data-testid="username-input"]').type("");
                cy.get('[data-testid="password-input"]').type("");

                // Авторизация
                cy.get('#login-button').click();

                cy.get('a[href="#/main"]').click();

                cy.get('#joinCourse-button').click();

                // Проверяем, что модальное окно открылось
                cy.get('[role="dialog"]').should('be.visible');

                // Ввод данных в форму
                if (code !== "") cy.get('[data-testid="code-input"]').type(code);

                // Присоединение к курсу
                cy.get('[role="dialog"]').contains('Присоединиться').click();

                // Проверяем, что модальное окно исчезло
                cy.get('[role="dialog"]').should('not.exist');

                // перенос в этот курсы
                // cy.url().should('include', '/main')
            });
        });
    });

    describe('Проверка покидания курса', () => {
        it('Пользователь удаляется из курса', () => {
            // Ввод данных в форму
            cy.get('[data-testid="username-input"]').type("");
            cy.get('[data-testid="password-input"]').type("");

            // Авторизация
            cy.get('#login-button').click();

            cy.get('a[href="#/main"]').click();

            cy.get('#leaveCourse-button').click();

        });
    });

})
