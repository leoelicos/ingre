/* Firebase Auth: the stand-in for firebase-admin/auth (see firebaseAdminApp.ts). */
export const getAuth = (app: object) => ({
  app,
  verifyIdToken: () =>
    Promise.reject(new Error('Firebase is not set up in tests'))
})
