// @nestjs/passport 12 ships only as ESM ("type": "module") and Jest runs in CommonJS,
// so `pnpm test:e2e` died with "Unexpected token 'export'". The app itself works because
// Node 22 can require() ESM, but Jest has its own module loader that cannot.
// This transformer rewrites those few files to CommonJS with the TypeScript compiler.
// Only the packages allowed in transformIgnorePatterns (jest-e2e.json) go through here.
const ts = require('typescript');

module.exports = {
  process(sourceText, sourcePath) {
    const { outputText } = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2021,
        allowJs: true,
        esModuleInterop: true,
      },
    });

    return { code: outputText };
  },
};
