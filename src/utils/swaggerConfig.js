import swaggerJSDoc from "swagger-jsdoc";
import { version } from "../../package.json";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My Brand API",
      version,
      description:
        "This is the backend api of my brand portfolio known as Capston Project buit while at Andela Technical Leadership Program (ATLP) in 2022 as my first ATLP project.",
    },
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/routes/api/*.js",
    "./src/models/*.js",
    "./src/routes/routes.js",
  ],
};

const specs = swaggerJSDoc(options);

export default specs;
