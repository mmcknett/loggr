describe('Loggr End-to-end happy path tests', () => {
  it('Loads the page', () => {
    cy.visit('http://localhost:5173/');
  });

  it('Creates a new user', () => {
    cy.visit('http://localhost:5173');
    cy.get('.signup-link').click();
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('anyPassw0rd');
    cy.get('#tos').click();
    cy.get('#privacy').click();
    cy.get('form').submit();

    // Expect that we are taken to the entry form after signup.
    cy.contains('Add Log Entry');
  })
})