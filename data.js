/* FINTA - catálogo de produtos e gerador de camisas em SVG */

const CATEGORIAS = {
  brasileiro: 'Futebol Brasileiro',
  europeu: 'Futebol Europeu',
  retro: 'Retrô'
};

const TAMANHOS = ['P', 'M', 'G', 'GG', 'XGG'];

/* cores: [base, detalhe, acabamento] | padrao: liso, listras, faixas, central, diagonal */
const PRODUTOS = [
  // Brasileiro
  { id: 1, nome: 'Flamengo I 26/27 – Manga curta Versão jogador', cat: 'brasileiro', preco: 180, cores: ['#c8102e', '#111111', '#ffffff'], padrao: 'faixas', nota: 4.8, aval: 312, vendidos: 980 },
  { id: 2, nome: 'SC Inter II 26/27 – Manga curta Versão jogador', cat: 'brasileiro', preco: 180, cores: ['#ffffff', '#c8102e', '#e63946'], padrao: 'liso', nota: 4.5, aval: 198, vendidos: 870 },
  { id: 3, nome: 'Grêmio I 26/27 – Manga curta Versão torcedor', cat: 'brasileiro', preco: 180, cores: ['#0d8bd9', '#111111', '#ffffff'], padrao: 'listras', nota: 4.7, aval: 241, vendidos: 760 },
  { id: 4, nome: 'Corinthians II 26/27 – Manga curta Versão jogador', cat: 'brasileiro', preco: 180, cores: ['#111111', '#ffffff', '#ffffff'], padrao: 'liso', nota: 4.6, aval: 176, vendidos: 540 },
  { id: 5, nome: 'Palmeiras I 26/27 – Manga curta Versão torcedor', cat: 'brasileiro', preco: 180, cores: ['#0b6b3a', '#ffffff', '#d9b84a'], padrao: 'liso', nota: 4.7, aval: 205, vendidos: 610 },
  { id: 6, nome: 'Santos I 26/27 – Manga curta Versão torcedor', cat: 'brasileiro', preco: 180, cores: ['#ffffff', '#111111', '#111111'], padrao: 'liso', nota: 4.4, aval: 133, vendidos: 420 },
  // Europeu
  { id: 7, nome: 'PSG I 26/27 – Manga curta Versão jogador', cat: 'europeu', preco: 180, cores: ['#0a1e4a', '#c8102e', '#ffffff'], padrao: 'central', nota: 4.9, aval: 402, vendidos: 1120 },
  { id: 8, nome: 'Real Madrid I 26/27 – Manga curta Versão torcedor', cat: 'europeu', preco: 180, cores: ['#ffffff', '#f1c40f', '#1d3a8a'], padrao: 'liso', nota: 4.8, aval: 388, vendidos: 1040 },
  { id: 9, nome: 'Barcelona I 26/27 – Manga curta Versão jogador', cat: 'europeu', preco: 180, cores: ['#a50044', '#004d98', '#edbb00'], padrao: 'listras', nota: 4.8, aval: 351, vendidos: 930 },
  { id: 10, nome: 'Manchester United I 26/27 – Manga curta', cat: 'europeu', preco: 180, cores: ['#da020e', '#111111', '#ffffff'], padrao: 'liso', nota: 4.6, aval: 220, vendidos: 580 },
  { id: 11, nome: 'Juventus I 26/27 – Manga curta Versão torcedor', cat: 'europeu', preco: 180, cores: ['#ffffff', '#111111', '#111111'], padrao: 'listras', nota: 4.5, aval: 168, vendidos: 450 },
  { id: 12, nome: 'Bayern de Munique I 26/27 – Manga curta', cat: 'europeu', preco: 180, cores: ['#dc052d', '#ffffff', '#0066b2'], padrao: 'liso', nota: 4.6, aval: 190, vendidos: 470 },
  // Retrô
  { id: 13, nome: 'Seleção Brasileira 1970 – Retrô Manga curta', cat: 'retro', preco: 250, cores: ['#f6d51c', '#0b7a3b', '#0b7a3b'], padrao: 'liso', nota: 5.0, aval: 97, vendidos: 360 },
  { id: 14, nome: 'Milan 1990 – Retrô Manga curta', cat: 'retro', preco: 250, cores: ['#c8102e', '#111111', '#ffffff'], padrao: 'listras', nota: 4.9, aval: 84, vendidos: 310 },
  { id: 15, nome: 'Argentina 1986 – Retrô Manga curta', cat: 'retro', preco: 250, cores: ['#75aadb', '#ffffff', '#111111'], padrao: 'listras', nota: 4.9, aval: 121, vendidos: 400 },
  { id: 16, nome: 'Holanda 1988 – Retrô Manga curta', cat: 'retro', preco: 250, cores: ['#ff6a13', '#ffffff', '#111111'], padrao: 'liso', nota: 4.8, aval: 76, vendidos: 250 },
  { id: 17, nome: 'Flamengo 1981 – Retrô Manga curta', cat: 'retro', preco: 250, cores: ['#c8102e', '#111111', '#ffffff'], padrao: 'faixas', nota: 5.0, aval: 143, vendidos: 520 },
  { id: 18, nome: 'Barcelona 2009 – Retrô Manga curta', cat: 'retro', preco: 250, cores: ['#a50044', '#004d98', '#edbb00'], padrao: 'diagonal', nota: 4.9, aval: 109, vendidos: 340 }
];

const DESCRICAO_BASE = 'Camisa de torcedor com tecido leve e respirável, escudo bordado e acabamento premium. Modelagem confortável para o dia a dia e para a arquibancada. Consulte a tabela de tamanhos: se estiver entre dois números, recomendamos o maior.';

const AVALIACOES = [
  { nome: 'Rafael M.', nota: 5, txt: 'Qualidade absurda, chegou antes do prazo e o tecido é muito bom.' },
  { nome: 'Camila S.', nota: 5, txt: 'Igualzinha às fotos. Tamanho veio certinho, recomendo!' },
  { nome: 'Bruno T.', nota: 4, txt: 'Muito boa, só achei a manga um pouco justa. Entrega rápida.' },
  { nome: 'Juliana P.', nota: 5, txt: 'Presente para o meu pai e ele amou. Embalagem impecável.' }
];

/* Gera a camisa em SVG a partir das cores/padrão do produto */
function jerseySVG(p) {
  const [c1, c2, c3] = p.cores;
  const uid = 'j' + p.id + Math.floor(Math.random() * 1e5);
  let pat = '';
  if (p.padrao === 'listras') {
    for (let i = 0; i < 9; i += 2) pat += `<rect x="${10 + i * 20}" y="0" width="20" height="220" fill="${c2}"/>`;
  } else if (p.padrao === 'faixas') {
    for (let i = 0; i < 6; i++) pat += `<rect x="0" y="${28 + i * 32}" width="200" height="16" fill="${c2}"/>`;
  } else if (p.padrao === 'central') {
    pat = `<rect x="86" y="0" width="28" height="220" fill="${c2}"/><rect x="92" y="0" width="16" height="220" fill="${c3}"/>`;
  } else if (p.padrao === 'diagonal') {
    pat = `<polygon points="0,70 200,150 200,185 0,105" fill="${c2}"/><polygon points="0,105 200,185 200,200 0,120" fill="${c3}"/>`;
  }
  const dark = ['#ffffff', '#f6d51c', '#75aadb'].includes(c1) ? 0.08 : 0.28;
  return `<svg viewBox="0 0 200 215" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.nome}">
  <defs>
    <clipPath id="${uid}c"><path d="M62 22 L88 10 Q100 30 112 10 L138 22 L192 58 L168 98 L146 84 L146 202 L54 202 L54 84 L32 98 L8 58 Z"/></clipPath>
    <linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${dark}"/></linearGradient>
  </defs>
  <g clip-path="url(#${uid}c)">
    <rect width="200" height="215" fill="${c1}"/>${pat}
    <rect width="200" height="215" fill="url(#${uid}g)"/>
    <path d="M8 58 L32 98 L52 86 L30 46 Z" fill="${c3}" opacity=".0"/>
    <line x1="20" y1="78" x2="38" y2="88" stroke="${c3}" stroke-width="7"/>
    <line x1="180" y1="78" x2="162" y2="88" stroke="${c3}" stroke-width="7"/>
  </g>
  <path d="M62 22 L88 10 Q100 30 112 10 L138 22 L192 58 L168 98 L146 84 L146 202 L54 202 L54 84 L32 98 L8 58 Z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
  <path d="M86 10 Q100 34 114 10" fill="none" stroke="${c3}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="124" cy="56" r="8" fill="${c3}" stroke="rgba(0,0,0,.35)"/>
  <circle cx="124" cy="56" r="3.5" fill="${c2 === c3 ? c1 : c2}"/>
  <rect x="62" y="194" width="76" height="3" fill="${c3}" opacity=".7"/>
</svg>`;
}
