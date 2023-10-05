Changes required to deploy this to production:
- Add a "summary" field to modules which holds the preview text. Will default to null
  `alter table Modules add column summary varchar(500) after name;`
