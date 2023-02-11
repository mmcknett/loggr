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
})