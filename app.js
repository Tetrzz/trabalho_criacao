/* FINTA - núcleo: utilitários, carrinho, autenticação, cabeçalho/rodapé */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const BRL = n => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const qs = k => new URLSearchParams(location.search).get(k);
const prod = id => PRODUTOS.find(p => p.id === Number(id));

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
  del(k) { try { localStorage.removeItem(k); } catch { } }
};

const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM1 2v2h2l3.6 7.6-1.4 2.4A2 2 0 0 0 7 17h12v-2H7.4l1.1-2h7.5a2 2 0 0 0 1.7-1l3.6-6.5A1 1 0 0 0 20.4 4H5.2l-.9-2z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3.2"/><path d="M5.8 19c1.5-3 4-4 6.2-4s4.7 1 6.2 4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="20" height="20"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  crown: '<svg viewBox="0 0 64 64" fill="none" stroke="#8b5cf6" stroke-width="4" stroke-linejoin="round"><path d="M8 48 4 18l15 14 13-22 13 22 15-14-4 30z" fill="rgba(139,92,246,.25)"/><path d="M8 54h48"/></svg>'
};

/* ---------- UI ---------- */
function toast(msg, tipo = '') {
  let box = $('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'toast ' + tipo; t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
const stars = n => `<span class="stars" style="--r:${n}" aria-label="${n} de 5">★★★★★</span>`;

function cardHTML(p, tag = '') {
  return `<article class="card">
    ${tag ? `<span class="tag">${tag}</span>` : ''}
    <a href="produto.html?id=${p.id}" class="img">${jerseySVG(p)}</a>
    <div class="info">
      <a href="produto.html?id=${p.id}" class="nome">${esc(p.nome)}</a>
      <div class="rate">${stars(p.nota)} <span>${p.nota.toFixed(1)} (${p.aval})</span></div>
      <div class="preco">${BRL(p.preco)}<small>ou 3x ${BRL(p.preco / 3)}</small></div>
      <div class="add"><a class="btn sec" href="produto.html?id=${p.id}">Ver produto</a></div>
    </div>
  </article>`;
}

/* ---------- Carrinho ---------- */
const Cart = {
  items() { return store.get('finta_cart', []); },
  save(i) { store.set('finta_cart', i); renderBadge(); },
  add(id, tam, qtd = 1) {
    const it = this.items();
    const f = it.find(x => x.id === id && x.tam === tam);
    if (f) f.qtd = Math.min(10, f.qtd + qtd); else it.push({ id, tam, qtd });
    this.save(it);
  },
  setQty(id, tam, qtd) {
    let it = this.items();
    it = it.map(x => (x.id === id && x.tam === tam) ? { ...x, qtd: Math.max(1, Math.min(10, qtd)) } : x);
    this.save(it);
  },
  remove(id, tam) { this.save(this.items().filter(x => !(x.id === id && x.tam === tam))); },
  clear() { store.del('finta_cart'); store.del('finta_cupom'); store.del('finta_frete'); renderBadge(); },
  count() { return this.items().reduce((s, x) => s + x.qtd, 0); },
  detailed() { return this.items().map(x => ({ ...x, p: prod(x.id) })).filter(x => x.p); },
  subtotal() { return this.detailed().reduce((s, x) => s + x.p.preco * x.qtd, 0); },
  cupom() { return store.get('finta_cupom', null); },
  desconto() {
    const c = this.cupom(); if (!c) return 0;
    return c.codigo === 'FINTA10' ? this.subtotal() * 0.10 : 0;
  },
  frete() { return store.get('finta_frete', null); },
  freteValor() {
    const f = this.frete(); if (!f) return 0;
    const c = this.cupom();
    if (c && c.codigo === 'FRETEGRATIS') return 0;
    if (f.id === 'eco' && this.subtotal() >= 400) return 0;
    return f.valor;
  },
  total() { return Math.max(0, this.subtotal() - this.desconto() + this.freteValor()); },
  aplicarCupom(cod) {
    cod = cod.trim().toUpperCase();
    if (!['FINTA10', 'FRETEGRATIS'].includes(cod)) return false;
    store.set('finta_cupom', { codigo: cod }); return true;
  }
};

/* Frete simulado por região do CEP */
function calcFrete(cep) {
  const d = String(cep).replace(/\D/g, '');
  if (d.length !== 8) return null;
  const r = Number(d[0]);
  const base = { 9: 14.9, 8: 17.9, 7: 29.9, 6: 34.9, 5: 27.9, 4: 27.9, 3: 22.9, 2: 21.9, 1: 21.9, 0: 21.9 }[r];
  const dias = { 9: 3, 8: 4, 7: 7, 6: 9, 5: 8, 4: 8, 3: 5, 2: 5, 1: 5, 0: 5 }[r];
  return [
    { id: 'eco', nome: 'Econômico', valor: base, prazo: dias + 2 },
    { id: 'exp', nome: 'Expresso', valor: +(base * 1.8).toFixed(2), prazo: Math.max(1, dias - 2) }
  ];
}

/* ---------- Autenticação (demo: dados ficam no navegador) ---------- */
async function hash(txt) {
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 5381; for (const c of txt) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return 'f' + h;
  }
}
const Auth = {
  users() { return store.get('finta_users', []); },
  user() { const id = store.get('finta_session', null); return this.users().find(u => u.id === id) || null; },
  async register({ nome, email, senha }) {
    email = email.trim().toLowerCase();
    const us = this.users();
    if (us.some(u => u.email === email)) return { erro: 'Este e-mail já está cadastrado.' };
    const u = { id: Date.now(), nome: nome.trim(), email, hash: await hash(email + senha), cpf: '', tel: '', end: null };
    us.push(u); store.set('finta_users', us); store.set('finta_session', u.id);
    return { ok: u };
  },
  async login(email, senha) {
    email = email.trim().toLowerCase();
    const u = this.users().find(x => x.email === email);
    if (!u || u.hash !== await hash(email + senha)) return { erro: 'E-mail ou senha incorretos.' };
    store.set('finta_session', u.id); return { ok: u };
  },
  logout() { store.del('finta_session'); },
  update(patch) {
    const us = this.users(); const u = this.user(); if (!u) return;
    Object.assign(us.find(x => x.id === u.id), patch); store.set('finta_users', us);
  }
};
const Orders = {
  all() { const u = Auth.user(); return u ? store.get('finta_orders', []).filter(o => o.uid === u.id) : []; },
  get(id) { return store.get('finta_orders', []).find(o => o.id === id); },
  add(o) { const l = store.get('finta_orders', []); l.unshift(o); store.set('finta_orders', l); }
};

/* ---------- Validadores / máscaras ---------- */
const mask = {
  cpf: v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  cep: v => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
  tel: v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2'),
  card: v => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
  val: v => v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2'),
  cvv: v => v.replace(/\D/g, '').slice(0, 4)
};
function validCPF(c) {
  c = c.replace(/\D/g, ''); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  for (let t = 9; t < 11; t++) {
    let s = 0; for (let i = 0; i < t; i++) s += c[i] * (t + 1 - i);
    if (((s * 10) % 11) % 10 != c[t]) return false;
  }
  return true;
}
function luhn(n) {
  n = n.replace(/\D/g, ''); if (n.length < 13) return false;
  let s = 0, alt = false;
  for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; }
  return s % 10 === 0;
}
function bindMasks(root = document) {
  $$('[data-mask]', root).forEach(i => i.addEventListener('input', () => { i.value = mask[i.dataset.mask](i.value); }));
}
function setErr(input, msg) {
  const f = input.closest('.field'); if (!f) return;
  f.classList.toggle('bad', !!msg);
  const e = $('.err', f); if (e) e.textContent = msg || '';
}
async function buscaCEP(cep) {
  const d = cep.replace(/\D/g, ''); if (d.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    const j = await r.json(); return j.erro ? null : j;
  } catch { return null; }
}

/* ---------- Cabeçalho e rodapé ---------- */
function renderBadge() { $$('.js-cart-count').forEach(b => { const n = Cart.count(); b.textContent = n || ''; b.dataset.n = n; }); }

function renderLayout() {
  const u = Auth.user();
  const pg = document.body.dataset.page;
  const cat = qs('cat');
  const h = $('#app-header');
  if (h) h.innerHTML = `
  <div class="promo">Use o cupom <b>FINTA10</b> e ganhe 10% OFF · Frete econômico grátis acima de <b>R$ 400</b></div>
  <header class="header">
    <div class="header-in">
      <a href="index.html" class="logo" aria-label="FINTA - início">${ICON.crown}<div>FIN<span>TA</span></div></a>
      <form class="search" action="index.html" method="get" role="search">
        <input name="q" type="search" placeholder="Buscar camisas, times, retrô..." value="${esc(qs('q') || '')}" aria-label="Buscar">
        <button aria-label="Buscar">${ICON.search}</button>
      </form>
      <nav class="nav">
        <a class="icon-btn" href="index.html" title="Início">${ICON.home}</a>
        <a class="icon-btn" href="${u ? 'conta.html' : 'login.html'}" title="${u ? 'Minha conta' : 'Entrar'}">${ICON.user}</a>
        <a class="icon-btn" href="carrinho.html" title="Carrinho">${ICON.cart}<span class="badge js-cart-count"></span></a>
      </nav>
    </div>
    <div class="subnav">
      <a href="index.html" class="${pg === 'home' && !cat && !qs('q') ? 'on' : ''}">Início</a>
      <a href="index.html?cat=todos" class="${cat === 'todos' ? 'on' : ''}">Todas as camisas</a>
      ${Object.entries(CATEGORIAS).map(([k, v]) => `<a href="index.html?cat=${k}" class="${cat === k ? 'on' : ''}">${v}</a>`).join('')}
      <a href="conta.html?tab=pedidos">Meus pedidos</a>
    </div>
  </header>`;
  const f = $('#app-footer');
  if (f) f.innerHTML = `
  <footer class="footer"><div class="footer-in">
    <div><div class="logo" style="margin-bottom:10px">${ICON.crown}<div>FIN<span>TA</span></div></div>
      <p>As melhores camisas de futebol do Brasil, da Europa e clássicos retrô. Qualidade premium, envio para todo o país.</p></div>
    <div><h4>Loja</h4>${Object.entries(CATEGORIAS).map(([k, v]) => `<a href="index.html?cat=${k}">${v}</a>`).join('')}</div>
    <div><h4>Conta</h4><a href="login.html">Entrar</a><a href="conta.html?tab=pedidos">Meus pedidos</a><a href="carrinho.html">Carrinho</a></div>
    <div><h4>Ajuda</h4><a href="#">Trocas e devoluções</a><a href="#">Tabela de medidas</a><a href="#">Fale conosco</a></div>
  </div><div class="copy">© ${new Date().getFullYear()} FINTA · Site de demonstração — pagamentos e pedidos são simulados.</div></footer>`;
  renderBadge();
}
document.addEventListener('DOMContentLoaded', renderLayout);
