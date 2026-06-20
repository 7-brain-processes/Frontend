describe('US-01 & US-02. Настройка Peer-to-Peer оценивания и режимов проверки', () => {
  // Тест для AC-01.1
  it('Сценарий: Отображение параметров peer-to-peer при выборе соответствующего типа (AC-01.1)', () => {
    cy.contains('button', 'Добавить критерий').click();

    cy.get('#criterion-type-0').select('PEER_REVIEW'); 

    cy.get('#criterion-reviewers-count-0').should('be.visible');
    cy.get('#criterion-scoring-strategy-0').should('be.visible');
    cy.get('#criterion-first-deadline-0').should('be.visible');
    cy.get('#criterion-second-deadline-0').should('be.visible');
  });

  // Тест для AC-01.2, AC-01.3, AC-02.1 - AC-02.3
  it('Сценарий: Успешная настройка параметров многие-к-одному и сохранение задания (AC-01.2, AC-01.3, AC-02.2, AC-02.3)', () => {
    cy.intercept('POST', '**/posts', { statusCode: 201 }).as('saveTaskRequest');

    // 1. Добавляем критерий и включаем режим peer-to-peer
    cy.contains('button', 'Добавить критерий').click();
    cy.get('#criterion-type-0').select('PEER_REVIEW');

    // 2. Задаем параметры проверки (Критерии AC-01.2 и AC-02.3)
    cy.get('#criterion-reviewers-count-0').clear().type('3');
    cy.get('#criterion-scoring-strategy-0').select('AVERAGE');
    cy.get('#criterion-first-deadline-0').type('2026-06-30');
    cy.get('#criterion-second-deadline-0').type('2026-07-05');
    cy.get('#criterion-redistribution-0').clear().type('2');
    cy.get('#criterion-penalty-0').clear().type('10');
    
    // Выбираем режим "Многие-к-одному" (Критерий AC-02.2)
    cy.get('#criterion-review-mode-0').select('MANY_TO_ONE');
    cy.get('#criterion-usage-type-0').select('SEPARATE_GRADE');

    // 3. Нажимаем кнопку "Создать"
    cy.contains('button', 'Создать').click();

    // 4. Верификация контракта данных 
    cy.wait('@saveTaskRequest').then((interception) => {
      const requestBody = interception.request.body;
      
      // Находим массив критериев в отправленном JSON
      expect(requestBody.criteria[0].type).to.equal('PEER_REVIEW');
      
      // Извлекаем вложенный объект конфигурации peer-to-peer
      const p2pConfig = requestBody.criteria[0].peerReviewConfigRequest;
      
      expect(p2pConfig.reviewersCount).to.equal(3);
      expect(p2pConfig.scoringStrategy).to.equal('AVERAGE');
      expect(p2pConfig.firstDeadline).to.include('2026-06-30');
      expect(p2pConfig.secondDeadline).to.include('2026-07-05');
      expect(p2pConfig.redistributionFactor).to.equal(2);
      expect(p2pConfig.missedReviewPenalty).to.equal(10);
      expect(p2pConfig.reviewMode).to.equal('MANY_TO_ONE');
      expect(p2pConfig.usageType).to.equal('SEPARATE_GRADE');
    });
  });
});
