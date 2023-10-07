Changes required to deploy this to production:
- Remove all users with names longer than 32 chars (legacy users, no associated modules)
- Add a "summary" field to modules which holds the preview text. Will default to null
  `alter table Modules add column summary varchar(500) after name;`
