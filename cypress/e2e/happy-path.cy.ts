const INDEX = 'http://localhost:5000/'; // The URL for the firebase hosting emulator

describe('Loggr End-to-end happy path tests', () => {
  beforeEach(() => {
    cy.visit(INDEX);
  })

  after(() => {
    cy.deleteUser();
    cy.clearDb();
  });

  it('Lets a new user make an account, log in, and make drafts and notes', () => {


    cy.log('# Shows a loading spinner');

    cy.contains('Loading');


    cy.log('# Creates a new user');

    cy.get('.signup-link').click();
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('anyPassw0rd');
    cy.get('#tos').click();
    cy.get('#privacy').click();
    cy.get('form').submit();

    // Expect that we are taken to the entry form after signup.
    cy.contains('Add Log Entry');


    cy.log('# Can log out and log in');

    cy.get('#logout').click();
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('anyPassw0rd');
    cy.get('form').submit();

    // Expect that we are taken to the entry form after signing back in.
    cy.contains('Add Log Entry');


    cy.log('# Can create a draft that persists');

    cy.get('#note').type('A draft note');
    cy.wait(1500); // Draft takes a second to save

    cy.visit(INDEX); // Reload the page to check persistence.

    // Expect the note to be there after reload.
    cy.get('#note').should('have.value', 'A draft note'); // .contains isn't working for a textarea; .should('have.value', ...) does, though.


    cy.log('# Can submit a note');

    cy.get('#note').type('{selectAll}{del}A permanent note');
    // FUTURE: This might fail later when the test runs after 8am and we stop allowing end time to be before start time.
    cy.get('#endTime').type('08:00');
    cy.get('form').submit();

    // Expect the note to appear in the grid below the form.
    cy.get('.note-display').contains('A permanent note');


    cy.log('# Can delete the note');

    cy.get('.delete-button').click();

    // Expect the grid to be empty after deleting the only item.
    cy.get('td').contains('No Data');
  });
})