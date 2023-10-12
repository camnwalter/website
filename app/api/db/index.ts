import type { DataSourceOptions } from "typeorm";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { Email, Module, Notification, Release, User } from "./entities";

export const connectionOptions: DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Email, Module, Notification, Release, User],
  namingStrategy: new SnakeNamingStrategy(),
  // synchronize: true,
};

export const db = new DataSource(connectionOptions);

if (!db.isInitialized) await db.initialize();

export type * from "./entities";
export { EmailType, Rank, Sort } from "./entities";
export { Email, Module, Notification, Release, User };

// import { sendMail } from "utils/api/email";

// await sendMail({
//   address: "matthewcolsson@gmail.com",
//   subject: "Test email from backend",
//   html: `
//   <html>
//   <head>
//     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//   </head>
//   <body>
//     <div style="padding:20px;">
//       <div style="max-width: 500px;">
//         <h2>Test Mail</h2>
//         <p>Hi there,<br/><br/>This is a test mail.</p>
//       </div>
//     </div>
//   </body>
//   </html>
//   `,
// });

// import { migrate } from "./migrate";
// await migrate();
// process.exit(0);