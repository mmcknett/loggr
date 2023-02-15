const INDEX = 'http://localhost:5000/'; // The URL for the firebase hosting emulator

describe('Loggr End-to-end happy path tests', () => {
  beforeEach(() => {
    cy.visit(INDEX);
  })

  after(() => {
    cy.deleteUser();
    cy.clearDb();
  });

  it('Shows a loading spinner', () => {
    cy.contains('Loading');
  });

  it('Creates a new user', () => {
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
    cy.get('#logout').click();
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('anyPassw0rd');
    cy.get('form').submit();

    // Expect that we are taken to the entry form after signup.
    cy.contains('Add Log Entry');
  });

  it('Can create a draft that persists', () => {
    cy.get('#note').type('A draft note');

    cy.wait(1100); // Draft takes a second to save

    cy.visit(INDEX);
    cy.get('#note').should('have.value', 'A draft note'); // .contains isn't working for a textarea; .should('have.value', ...) does, though.
  });

  it('Can submit a note', () => {
    cy.get('#note')
      .should('have.value', 'A draft note')
      .type('{selectAll}{del}A permanent note');
    // FUTURE: This might fail later when the test runs after 8am and we stop allowing end time to be before start time.
    cy.get('#endTime').type('08:00');
    cy.get('form').submit();
    cy.get('.note-display').contains('A permanent note');

    cy.wait(500); // Give the firestore library a chance to persist the change
  });

  it('Can delete the note', () => {
    cy.get('.delete-button').click();
    cy.get('td').contains('No Data');
  });
})