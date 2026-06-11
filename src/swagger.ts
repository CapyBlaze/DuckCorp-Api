import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Mon API TypeScript',
        description: 'Documentation auto-générée.',
    },
    host: 'localhost:3000'
};

const outputFile = '../swagger-output.json';
const routesFiles = ['./src/app.ts'];

const autogen = swaggerAutogen();
autogen(outputFile, routesFiles, doc);
