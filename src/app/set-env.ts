const fs = require("fs");
// targetPath should reflect where the .env file should go
const targetPath = "./src/app/shared/env/environment.prod.ts";
const envConfigFile = `
export const environment = {
  production: true,
  SUPABASE_URL: '${process.env["SUPABASE_URL"]}',
  ANON_KEY: '${process.env["ANON_KEY"]}',
  BASE_URL:'${process.env["BASE_URL"]}'
};
`;
fs.writeFileSync(targetPath, envConfigFile);
console.log(`Output generated at ${targetPath}`);