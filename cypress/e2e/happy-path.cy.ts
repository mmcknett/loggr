const INDEX = 'http://localhost:5173/';

describe('Loggr End-to-end happy path tests', () => {
  it('Loads the page', () => {
    cy.visit(INDEX);
  });

  it('Creates a new user', () => {
    cy.visit(INDEX);

    cy.get('.signup-link').click();
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('anyPassw0rd');
    cy.get('#tos').click();
    cy.get('#privacy').click();
    cy.get('form').submit();

    // Expect that we are taken to the entry form after signup.
    cy.contains('Add Log Entry');
  });

  it('Can log out and log in', () => {
    cy.visit(INDEX);

    cy.get('#logout').click();
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('anyPassw0rd');
    cy.get('form').submit();

    // Expect that we are taken to the entry form after signup.
    cy.contains('Add Log Entry');
  });

  it('Can create a draft that persists', () => {
    cy.visit(INDEX);
    cy.get('#note').type('A draft note');

    cy.wait(1100); // Draft takes a second to save

    cy.visit(INDEX);
    cy.get('#note').contains('A draft note');
  });

  it('Can submit a draft', () => {
    cy.visit(INDEX);
    cy.get('#endTime').type('08:00'); // This might fail later when the test runs after 8am and we stop allowing end time to be before start time.
  });
})