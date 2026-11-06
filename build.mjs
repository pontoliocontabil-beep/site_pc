// Gera os arquivos JavaScript do site e do painel a partir de src/  →  npm run build
// Também carimba a versão nos endereços dos arquivos (ex.: site.css?v=3.0.0) para o navegador
// baixar sempre a versão nova depois de publicar, e grava public/versao.json.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const VERSAO = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf8')).version;
const TESTE = process.argv.includes('--teste');
const comum = { bundle: true, minify: true, format: 'iife', target: ['es2019'], legalComments: 'none', logLevel: 'info', charset: 'utf8' };
const apelidos = {
  name: 'apelidos',
  setup(b) {
    b.onResolve({ filter: /^#armazenamento$/ }, () => ({ path: path.join(raiz, 'src/admin/armazenamento-firestore.js') }));
  }
};

await build({ ...comum, entryPoints: [path.join(raiz, 'src/publico/cms-publico.js')], outfile: path.join(raiz, 'public/assets/js/cms-publico.js') });
await build({ ...comum, entryPoints: [path.join(raiz, 'src/publico/site.js')], outfile: path.join(raiz, 'public/assets/js/site.js') });
await build({
  ...comum,
  entryPoints: [path.join(raiz, 'src/admin/main.js')],
  outfile: path.join(raiz, TESTE ? 'teste/admin.teste.js' : 'public/admin/admin.js'),
  define: { __EMULADOR__: TESTE ? 'true' : 'false', __VERSAO__: JSON.stringify(VERSAO) },
  plugins: [apelidos]
});

for (const arquivo of ['index.html', 'artigo.html', 'pagina.html', 'admin/index.html']) {
  const caminho = path.join(raiz, 'public', arquivo);
  const html = readFileSync(caminho, 'utf8').replace(
    /((?:href|src)="(?:\.\.\/)?(?:assets\/(?:css|js)\/[\w.-]+|admin\.(?:css|js)))(?:\?v=[^"]*)?"/g,
    `$1?v=${VERSAO}"`
  );
  writeFileSync(caminho, html);
}
writeFileSync(path.join(raiz, 'public/versao.json'), JSON.stringify({ versao: VERSAO, gerado: new Date().toISOString() }) + '\n');
console.log(`\nVersão ${VERSAO} pronta em public/`);
