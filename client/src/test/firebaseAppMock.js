/* Firebase Auth: tests never load the Firebase SDK; a test that needs it uses jest.mock. */
module.exports = { initializeApp: () => ({}) }
