-- Firebase Auth: the Firebase uid each user signs in with (null until linked). Firebase
-- holds the password of a user made through it, so such a user has no bcrypt hash; the
-- hash is kept for the legacy login and the password import (docs/AUTH.md).
alter table users add column firebase_uid text unique;
alter table users alter column password_hash drop not null;
