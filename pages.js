/* FINTA - lógica de cada página */
const PAGES = {};
const view = () => $('#view');

/* ================= HOME ================= */
PAGES.home = () => {
  const q = (qs('q') || '').trim().toLowerCase();
  const cat = qs('cat');
  const v = view();

  if (q || cat) {
    let list = PRODUTOS.filter(p => (!cat || cat === 'todos' || p.cat === cat) && (!q || (p.nome + ' ' + CATEGORIAS[p.cat]).toLowerCase().includes(q)));
    const titulo = q ? `Resultados para "${esc(qs('q'))}"` : (cat === 'todos' ? 'Todas as camisas' : CATEGORIAS[cat] || 'Camisas');
    v.innerHTML = `
      <h1 class="page-t">${titulo}</h1>
      <div class="toolbar">
        <div class="chips">
          <a class="chip ${cat === 'todos' || (!cat && q) ? 'on' : ''}" href="index.html?cat=todos">Todas</a>
          ${Object.entries(CATEGORIAS).map(([k, n]) => `<a class="chip ${cat === k ? 'on' : ''}" href="index.html?cat=${k}">${n}</a>`).join('')}
        </div>
        <select id="ord" aria-label="Ordenar" style="margin-left:auto">
          <option value="rel">Mais relevantes</option><option value="vend">Mais vendidos</option>
          <option value="asc">Menor preço</option><option value="desc">Maior preço</option><option value="nota">Melhor avaliados</option>
        </select>
      </div>
      <div class="grid" id="lista"></div>`;
    const draw = () => {
      const o = $('#ord').value;
      const l = [...list];
      if (o === 'vend') l.sort((a, b) => b.vendidos - a.vendidos);
      if (o === 'asc') l.sort((a, b) => a.preco - b.preco);
      if (o === 'desc') l.sort((a, b) => b.preco - a.preco);
      if (o === 'nota') l.sort((a, b) => b.nota - a.nota);
      $('#lista').innerHTML = l.length ? l.map(p => cardHTML(p)).join('') :
        `<div class="empty" style="grid-column:1/-1"><h3>Nada encontrado</h3><p>Tente outro termo ou veja <a class="link" href="index.html?cat=todos">todas as camisas</a>.</p></div>`;
    };
    $('#ord').onchange = draw; draw();
    return;
  }

  const top = [...PRODUTOS].sort((a, b) => b.vendidos - a.vendidos).slice(0, 4);
  const sec = (t, l, tag) => `<section class="section"><div class="section-t"><h2>${t}</h2></div><div class="grid">${l.map(p => cardHTML(p, tag)).join('')}</div></section>`;
  const porCat = k => PRODUTOS.filter(p => p.cat === k).slice(0, 4);
  v.innerHTML = `
    <section class="hero">
      <div>
        <h1>Vista a paixão com <em>estilo</em></h1>
        <p>Camisas de clubes e seleções, versões jogador e torcedor, retrôs lendários. Entrega para todo o Brasil.</p>
        <a class="btn" href="index.html?cat=todos">Ver todas as camisas</a>
      </div>
      <div class="hero-shirts">${[7, 1, 3].map(id => jerseySVG(prod(id))).join('')}</div>
    </section>
    <div class="cats">
      ${[['brasileiro', 1], ['europeu', 7], ['retro', 13]].map(([k, id]) => `<a class="cat" href="index.html?cat=${k}"><div class="ring">${jerseySVG(prod(id))}</div>${CATEGORIAS[k]}</a>`).join('')}
      <a class="cat" href="index.html?cat=todos"><div class="ring" style="font-size:1.6rem;color:var(--neon)">＋</div>Ver tudo</a>
    </div>
    ${sec('Mais vendidos', top, '🔥 Top')}
    ${sec('Futebol Brasileiro', porCat('brasileiro'))}
    ${sec('Futebol Europeu', porCat('europeu'))}
    ${sec('Retrô', porCat('retro'))}`;
};

/* ================= PRODUTO ================= */
PAGES.produto = () => {
  const p = prod(qs('id'));
  const v = view();
  if (!p) { v.innerHTML = `<div class="empty"><h3>Produto não encontrado</h3><a class="btn" href="index.html">Voltar à loja</a></div>`; return; }
  document.title = p.nome + ' · FINTA';
  let tam = null, qtd = 1;
  const rel = PRODUTOS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  v.innerHTML = `
    <div class="crumbs"><a href="index.html">Início</a> › <a href="index.html?cat=${p.cat}">${CATEGORIAS[p.cat]}</a> › ${esc(p.nome)}</div>
    <div class="pdp">
      <div class="pdp-img">${jerseySVG(p)}</div>
      <div>
        <h1>${esc(p.nome)}</h1>
        <div class="rate" style="margin:8px 0">${stars(p.nota)} <span>${p.nota.toFixed(1)} · ${p.aval} avaliações · ${p.vendidos}+ vendidos</span></div>
        <div class="price">${BRL(p.preco)}</div>
        <div class="parc">ou 3x de ${BRL(p.preco / 3)} sem juros · 5% OFF no Pix: <b style="color:var(--neon)">${BRL(p.preco * 0.95)}</b></div>
        <div class="label">Tamanho</div>
        <div class="sizes" id="sizes">${TAMANHOS.map(t => `<button class="size" data-t="${t}">${t}</button>`).join('')}</div>
        <div class="label">Quantidade</div>
        <div class="buy-row">
          <div class="qty"><button id="menos" aria-label="Diminuir">−</button><span id="qtd">1</span><button id="mais" aria-label="Aumentar">+</button></div>
        </div>
        <div class="buy-row">
          <button class="btn" id="add">Adicionar ao carrinho</button>
          <button class="btn sec" id="comprar">Comprar agora</button>
        </div>
        <p class="desc">${DESCRICAO_BASE}</p>
        <div class="frete-box">
          <div class="label" style="margin-bottom:8px">Calcular frete e prazo</div>
          <div class="row"><div class="field" style="flex:1"><input id="cep" data-mask="cep" placeholder="00000-000" inputmode="numeric"></div><button class="btn sec" id="calc">Calcular</button></div>
          <div id="frete-res" style="margin-top:10px;font-size:.9rem"></div>
        </div>
        <div class="perks">
          <div>🚚 <span><b>Frete econômico grátis</b> em compras acima de R$ 400</span></div>
          <div>🔄 <span><b>7 dias</b> para troca ou devolução</span></div>
          <div>🔒 <span><b>Compra segura</b> · Pix, cartão e boleto</span></div>
        </div>
      </div>
    </div>
    <section class="reviews"><div class="section-t"><h2>Avaliações</h2></div>
      ${AVALIACOES.map(a => `<div class="review"><header><b>${a.nome}</b>${stars(a.nota)}</header><p style="color:var(--purple3)">${a.txt}</p></div>`).join('')}
    </section>
    <section class="section"><div class="section-t"><h2>Você também pode gostar</h2></div><div class="grid">${rel.map(x => cardHTML(x)).join('')}</div></section>`;
  bindMasks(v);
  $$('.size').forEach(b => b.onclick = () => { tam = b.dataset.t; $$('.size').forEach(x => x.classList.toggle('on', x === b)); });
  $('#mais').onclick = () => { qtd = Math.min(10, qtd + 1); $('#qtd').textContent = qtd; };
  $('#menos').onclick = () => { qtd = Math.max(1, qtd - 1); $('#qtd').textContent = qtd; };
  const adicionar = () => {
    if (!tam) { toast('Selecione um tamanho.', 'err'); $('#sizes').scrollIntoView({ block: 'center', behavior: 'smooth' }); return false; }
    Cart.add(p.id, tam, qtd); return true;
  };
  $('#add').onclick = () => { if (adicionar()) toast('Adicionado ao carrinho ✔'); };
  $('#comprar').onclick = () => { if (adicionar()) location.href = 'carrinho.html'; };
  $('#calc').onclick = () => {
    const op = calcFrete($('#cep').value);
    $('#frete-res').innerHTML = op ? op.map(o => `<div class="sum-line"><span>${o.nome} · ${o.prazo} dias úteis</span><b>${BRL(o.valor)}</b></div>`).join('') : '<span style="color:var(--err)">CEP inválido.</span>';
  };
};

/* ================= CARRINHO ================= */
PAGES.carrinho = () => {
  const v = view();
  const draw = () => {
    const its = Cart.detailed();
    if (!its.length) {
      v.innerHTML = `<div class="empty">${ICON.cart.replace('currentColor', '#8b5cf6')}<h3>Seu carrinho está vazio</h3><p style="margin-bottom:18px">Adicione camisas para começar sua compra.</p><a class="btn" href="index.html?cat=todos">Explorar camisas</a></div>`;
      return;
    }
    const f = Cart.frete(), c = Cart.cupom();
    v.innerHTML = `
      <h1 class="page-t">Meu <em>carrinho</em></h1>
      <div class="layout2">
        <div class="box">${its.map(x => `
          <div class="cart-item">
            <a href="produto.html?id=${x.p.id}" class="th">${jerseySVG(x.p)}</a>
            <div><h4>${esc(x.p.nome)}</h4><div class="meta">Tamanho ${x.tam} · ${BRL(x.p.preco)} un.</div>
              <div class="qty"><button data-a="menos" data-id="${x.id}" data-t="${x.tam}">−</button><span>${x.qtd}</span><button data-a="mais" data-id="${x.id}" data-t="${x.tam}">+</button></div></div>
            <div><div class="sub">${BRL(x.p.preco * x.qtd)}</div><button class="rm" data-a="rm" data-id="${x.id}" data-t="${x.tam}">Remover</button></div>
          </div>`).join('')}
          <div style="margin-top:12px"><button class="link" id="limpar">Esvaziar carrinho</button></div>
        </div>
        <aside class="box">
          <h3>Resumo</h3>
          <div class="sum-line"><span>Subtotal</span><span>${BRL(Cart.subtotal())}</span></div>
          ${Cart.desconto() ? `<div class="sum-line"><span>Cupom ${c.codigo}</span><span class="ok">− ${BRL(Cart.desconto())}</span></div>` : ''}
          <div class="sum-line"><span>Frete ${f ? '(' + f.nome + ')' : ''}</span><span>${f ? (Cart.freteValor() ? BRL(Cart.freteValor()) : '<b class="ok">Grátis</b>') : 'a calcular'}</span></div>
          <div class="sum-line total"><span>Total</span><b>${BRL(Cart.total())}</b></div>
          <div class="cupom"><input id="cupom" placeholder="Cupom de desconto" value="${c ? c.codigo : ''}"><button class="btn sec" id="ap">Aplicar</button></div>
          <div class="field" style="margin-bottom:12px"><label>Calcular frete</label>
            <div class="row"><input id="cep" data-mask="cep" placeholder="00000-000" value="${f && f.cep ? mask.cep(f.cep) : ''}" inputmode="numeric"><button class="btn sec" id="calc">OK</button></div>
            <div id="fopts" style="margin-top:8px"></div></div>
          <a class="btn block" href="checkout.html">Finalizar compra</a>
          <a class="btn sec block" style="margin-top:10px" href="index.html?cat=todos">Continuar comprando</a>
        </aside>
      </div>`;
    bindMasks(v);
    $$('[data-a]').forEach(b => b.onclick = () => {
      const id = +b.dataset.id, t = b.dataset.t, it = Cart.items().find(x => x.id === id && x.tam === t);
      if (b.dataset.a === 'mais') Cart.setQty(id, t, it.qtd + 1);
      if (b.dataset.a === 'menos') Cart.setQty(id, t, it.qtd - 1);
      if (b.dataset.a === 'rm') { Cart.remove(id, t); toast('Item removido.'); }
      draw();
    });
    $('#limpar').onclick = () => { if (confirm('Esvaziar o carrinho?')) { Cart.clear(); draw(); } };
    $('#ap').onclick = () => {
      if (!$('#cupom').value.trim()) { store.del('finta_cupom'); return draw(); }
      if (Cart.aplicarCupom($('#cupom').value)) { toast('Cupom aplicado!'); draw(); } else toast('Cupom inválido.', 'err');
    };
    $('#calc').onclick = () => {
      const op = calcFrete($('#cep').value);
      if (!op) return toast('CEP inválido.', 'err');
      const cep = $('#cep').value.replace(/\D/g, '');
      $('#fopts').innerHTML = op.map(o => `<label class="opt"><input type="radio" name="fr" value="${o.id}"><span class="grow">${o.nome}<small>${o.prazo} dias úteis</small></span><b class="pr">${BRL(o.valor)}</b></label>`).join('');
      $$('[name=fr]').forEach(r => r.onchange = () => {
        const o = op.find(x => x.id === r.value); store.set('finta_frete', { ...o, cep }); draw();
      });
    };
  };
  draw();
};

/* ================= LOGIN / CADASTRO ================= */
PAGES.login = () => {
  if (Auth.user()) { location.replace(qs('next') || 'conta.html'); return; }
  const next = qs('next') || 'conta.html';
  let modo = qs('modo') === 'cadastro' ? 'cadastro' : 'login';
  const v = view();
  const draw = () => {
    const c = modo === 'cadastro';
    v.innerHTML = `<div class="auth"><div class="box">
      <h1>${c ? 'Criar conta' : 'Entrar'}</h1>
      <p class="sub">${c ? 'Cadastre-se para comprar e acompanhar seus pedidos.' : 'Acesse sua conta para finalizar a compra.'}</p>
      <form id="f" class="form" novalidate>
        ${c ? `<div class="field"><label>Nome completo</label><input name="nome" autocomplete="name"><span class="err"></span></div>` : ''}
        <div class="field"><label>E-mail</label><input name="email" type="email" autocomplete="email"><span class="err"></span></div>
        <div class="field"><label>Senha</label><input name="senha" type="password" autocomplete="${c ? 'new-password' : 'current-password'}"><span class="err"></span></div>
        ${c ? `<div class="field"><label>Confirmar senha</label><input name="senha2" type="password" autocomplete="new-password"><span class="err"></span></div>` : ''}
        <div class="field"><span class="err" id="geral"></span><button class="btn block">${c ? 'Criar conta' : 'Entrar'}</button></div>
      </form>
      <p style="text-align:center;margin-top:16px;color:var(--muted)">${c ? 'Já tem conta?' : 'Novo por aqui?'} <button class="link" id="troca">${c ? 'Entrar' : 'Criar conta'}</button></p>
    </div></div>`;
    $('#troca').onclick = () => { modo = c ? 'login' : 'cadastro'; draw(); };
    $('#f').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, d = Object.fromEntries(new FormData(f)); let ok = true;
      const chk = (n, cond, msg) => { setErr(f[n], cond ? '' : msg); if (!cond) ok = false; };
      if (c) chk('nome', d.nome.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome.');
      chk('email', /^\S+@\S+\.\S+$/.test(d.email), 'E-mail inválido.');
      chk('senha', d.senha.length >= 6, 'Mínimo de 6 caracteres.');
      if (c) chk('senha2', d.senha === d.senha2, 'As senhas não coincidem.');
      if (!ok) return;
      const r = c ? await Auth.register(d) : await Auth.login(d.email, d.senha);
      if (r.erro) { $('#geral').textContent = r.erro; return; }
      toast(c ? 'Conta criada com sucesso!' : 'Bem-vindo de volta!');
      setTimeout(() => location.href = next, 500);
    };
  };
  draw();
};

/* ================= CHECKOUT ================= */
PAGES.checkout = () => {
  const u = Auth.user();
  if (!u) { location.replace('login.html?next=checkout.html'); return; }
  if (!Cart.count()) { location.replace('carrinho.html'); return; }
  const v = view();
  const e = u.end || {};
  v.innerHTML = `
    <h1 class="page-t">Finalizar <em>compra</em></h1>
    <div class="steps"><span class="on">1 · Identificação</span><span class="on">2 · Entrega</span><span class="on">3 · Pagamento</span></div>
    <form id="co" class="layout2" novalidate>
      <div style="display:grid;gap:18px">
        <section class="box"><h3>1 · Seus dados</h3><div class="form">
          <div class="field s3"><label>Nome completo</label><input name="nome" value="${esc(u.nome)}"><span class="err"></span></div>
          <div class="field s3"><label>E-mail</label><input value="${esc(u.email)}" disabled></div>
          <div class="field s3"><label>CPF</label><input name="cpf" data-mask="cpf" value="${esc(u.cpf)}" placeholder="000.000.000-00" inputmode="numeric"><span class="err"></span></div>
          <div class="field s3"><label>Celular</label><input name="tel" data-mask="tel" value="${esc(u.tel)}" placeholder="(00) 00000-0000" inputmode="numeric"><span class="err"></span></div>
        </div></section>
        <section class="box"><h3>2 · Endereço de entrega</h3><div class="form">
          <div class="field s2"><label>CEP</label><input name="cep" data-mask="cep" value="${esc(e.cep)}" placeholder="00000-000" inputmode="numeric"><span class="err"></span></div>
          <div class="field s4"><label>Rua / Avenida</label><input name="rua" value="${esc(e.rua)}"><span class="err"></span></div>
          <div class="field s2"><label>Número</label><input name="num" value="${esc(e.num)}"><span class="err"></span></div>
          <div class="field s4"><label>Complemento</label><input name="comp" value="${esc(e.comp)}"></div>
          <div class="field s2"><label>Bairro</label><input name="bairro" value="${esc(e.bairro)}"><span class="err"></span></div>
          <div class="field s3"><label>Cidade</label><input name="cidade" value="${esc(e.cidade)}"><span class="err"></span></div>
          <div class="field s3"><label>UF</label><input name="uf" maxlength="2" value="${esc(e.uf)}" style="text-transform:uppercase"><span class="err"></span></div>
        </div>
        <h3 style="margin:20px 0 10px">Forma de envio</h3>
        <div class="opts" id="fopts"><p style="color:var(--muted)">Informe o CEP para ver as opções de frete.</p></div><span class="err" id="ferr" style="color:var(--err);font-size:.78rem"></span></section>
        <section class="box"><h3>3 · Pagamento</h3>
          <div class="opts" style="margin-bottom:16px">
            <label class="opt"><input type="radio" name="pag" value="pix" checked><span class="grow">Pix<small>Aprovação imediata · 5% de desconto</small></span><b class="pr">−5%</b></label>
            <label class="opt"><input type="radio" name="pag" value="cartao"><span class="grow">Cartão de crédito<small>Até 3x sem juros</small></span></label>
            <label class="opt"><input type="radio" name="pag" value="boleto"><span class="grow">Boleto bancário<small>Vencimento em 3 dias</small></span></label>
          </div>
          <div id="cartao-box" class="form hidden">
            <div class="field"><label>Número do cartão</label><input name="cnum" data-mask="card" placeholder="0000 0000 0000 0000" inputmode="numeric" autocomplete="cc-number"><span class="err"></span></div>
            <div class="field"><label>Nome impresso</label><input name="cnome" autocomplete="cc-name"><span class="err"></span></div>
            <div class="field s2"><label>Validade</label><input name="cval" data-mask="val" placeholder="MM/AA" inputmode="numeric" autocomplete="cc-exp"><span class="err"></span></div>
            <div class="field s2"><label>CVV</label><input name="ccvv" data-mask="cvv" placeholder="123" inputmode="numeric" autocomplete="cc-csc"><span class="err"></span></div>
            <div class="field s2"><label>Parcelas</label><select name="parc"></select></div>
          </div>
          <p style="color:var(--muted);font-size:.8rem;margin-top:10px">Ambiente de demonstração: nenhum pagamento real é processado e os dados do cartão não são armazenados.</p>
        </section>
      </div>
      <aside class="box" style="position:sticky;top:130px"><h3>Resumo do pedido</h3><div id="resumo"></div>
        <button class="btn block" id="fim" style="margin-top:14px">Confirmar pedido</button>
        <a class="link" href="carrinho.html" style="display:block;text-align:center;margin-top:10px">Voltar ao carrinho</a>
      </aside>
    </form>`;
  const f = $('#co');
  bindMasks(v);
  let opcoes = [];

  const pagamento = () => f.pag.value;
  const resumo = () => {
    const pix = pagamento() === 'pix';
    const sub = Cart.subtotal(), desc = Cart.desconto(), fr = Cart.freteValor();
    const dPix = pix ? (sub - desc) * 0.05 : 0;
    const total = sub - desc - dPix + fr;
    $('#resumo').innerHTML = Cart.detailed().map(x => `<div class="mini-item"><div class="th">${jerseySVG(x.p)}</div><div class="grow">${esc(x.p.nome.split('–')[0])}<br><small style="color:var(--muted)">Tam. ${x.tam} · ${x.qtd}x</small></div><b>${BRL(x.p.preco * x.qtd)}</b></div>`).join('') + `
      <div class="sum-line" style="margin-top:8px"><span>Subtotal</span><span>${BRL(sub)}</span></div>
      ${desc ? `<div class="sum-line"><span>Cupom</span><span class="ok">− ${BRL(desc)}</span></div>` : ''}
      ${dPix ? `<div class="sum-line"><span>Desconto Pix</span><span class="ok">− ${BRL(dPix)}</span></div>` : ''}
      <div class="sum-line"><span>Frete</span><span>${Cart.frete() ? (fr ? BRL(fr) : '<b class="ok">Grátis</b>') : '—'}</span></div>
      <div class="sum-line total"><span>Total</span><b>${BRL(total)}</b></div>`;
    const sel = f.parc; const cur = sel.value || '1';
    sel.innerHTML = [1, 2, 3].map(n => `<option value="${n}">${n}x de ${BRL(total / n)}</option>`).join(''); sel.value = cur;
    return total;
  };
  const drawFrete = () => {
    const sel = Cart.frete();
    $('#fopts').innerHTML = opcoes.map(o => `<label class="opt"><input type="radio" name="fr" value="${o.id}" ${sel && sel.id === o.id ? 'checked' : ''}><span class="grow">${o.nome}<small>Chega em até ${o.prazo} dias úteis</small></span><b class="pr">${o.id === 'eco' && Cart.subtotal() >= 400 ? 'Grátis' : BRL(o.valor)}</b></label>`).join('');
    $$('[name=fr]', f).forEach(r => r.onchange = () => { store.set('finta_frete', { ...opcoes.find(o => o.id === r.value), cep: f.cep.value.replace(/\D/g, '') }); resumo(); });
    resumo();
  };
  const atualizaCEP = async () => {
    const op = calcFrete(f.cep.value);
    if (!op) return;
    opcoes = op;
    const saved = Cart.frete();
    if (!saved || saved.cep !== f.cep.value.replace(/\D/g, '')) store.set('finta_frete', { ...op[0], cep: f.cep.value.replace(/\D/g, '') });
    else store.set('finta_frete', { ...op.find(o => o.id === saved.id), cep: saved.cep });
    drawFrete();
    if (!f.rua.value) {
      const r = await buscaCEP(f.cep.value);
      if (r) { f.rua.value = r.logradouro || ''; f.bairro.value = r.bairro || ''; f.cidade.value = r.localidade || ''; f.uf.value = r.uf || ''; f.num.focus(); }
    }
  };
  f.cep.addEventListener('input', () => { if (f.cep.value.length === 9) atualizaCEP(); });
  if (e.cep) atualizaCEP(); else resumo();
  $$('[name=pag]', f).forEach(r => r.onchange = () => { $('#cartao-box').classList.toggle('hidden', pagamento() !== 'cartao'); resumo(); });

  f.onsubmit = async ev => {
    ev.preventDefault();
    let ok = true, first = null;
    const chk = (n, cond, msg) => { const i = f[n]; setErr(i, cond ? '' : msg); if (!cond) { ok = false; first = first || i; } };
    chk('nome', f.nome.value.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome.');
    chk('cpf', validCPF(f.cpf.value), 'CPF inválido.');
    chk('tel', f.tel.value.replace(/\D/g, '').length >= 10, 'Celular inválido.');
    chk('cep', f.cep.value.replace(/\D/g, '').length === 8, 'CEP inválido.');
    chk('rua', f.rua.value.trim(), 'Informe a rua.');
    chk('num', f.num.value.trim(), 'Informe o número.');
    chk('bairro', f.bairro.value.trim(), 'Informe o bairro.');
    chk('cidade', f.cidade.value.trim(), 'Informe a cidade.');
    chk('uf', /^[a-zA-Z]{2}$/.test(f.uf.value), 'UF inválida.');
    if (!Cart.frete()) { $('#ferr').textContent = 'Selecione uma forma de envio.'; ok = false; first = first || f.cep; } else $('#ferr').textContent = '';
    if (pagamento() === 'cartao') {
      const [mm, aa] = f.cval.value.split('/').map(Number);
      const agora = new Date(), ano = agora.getFullYear() % 100;
      chk('cnum', luhn(f.cnum.value), 'Número de cartão inválido.');
      chk('cnome', f.cnome.value.trim().length > 2, 'Informe o nome impresso.');
      chk('cval', mm >= 1 && mm <= 12 && (aa > ano || (aa === ano && mm >= agora.getMonth() + 1)), 'Validade inválida.');
      chk('ccvv', f.ccvv.value.length >= 3, 'CVV inválido.');
    }
    if (!ok) { toast('Revise os campos destacados.', 'err'); first && first.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }

    const total = resumo();
    const end = { cep: f.cep.value, rua: f.rua.value.trim(), num: f.num.value.trim(), comp: f.comp.value.trim(), bairro: f.bairro.value.trim(), cidade: f.cidade.value.trim(), uf: f.uf.value.toUpperCase() };
    Auth.update({ nome: f.nome.value.trim(), cpf: f.cpf.value, tel: f.tel.value, end });
    const pag = pagamento();
    const pedido = {
      id: 'FT' + Date.now().toString().slice(-8), uid: u.id, data: Date.now(),
      itens: Cart.detailed().map(x => ({ id: x.id, nome: x.p.nome, tam: x.tam, qtd: x.qtd, preco: x.p.preco })),
      subtotal: Cart.subtotal(), desconto: Cart.desconto() + (pag === 'pix' ? (Cart.subtotal() - Cart.desconto()) * 0.05 : 0),
      cupom: Cart.cupom()?.codigo || null, frete: Cart.freteValor(), freteNome: Cart.frete().nome, prazo: Cart.frete().prazo,
      total, pag, parcelas: pag === 'cartao' ? +f.parc.value : 1, end,
      pago: pag === 'cartao', pagoEm: pag === 'cartao' ? Date.now() : null,
      cartao: pag === 'cartao' ? '**** ' + f.cnum.value.replace(/\D/g, '').slice(-4) : null
    };
    $('#fim').disabled = true; $('#fim').textContent = 'Processando...';
    await new Promise(r => setTimeout(r, 900));
    Orders.add(pedido); Cart.clear();
    location.href = 'pedido.html?id=' + pedido.id + '&novo=1';
  };
};

/* ================= PEDIDO ================= */
function etapaPedido(o) { return o.pago ? Math.min(4, 1 + Math.floor((Date.now() - o.pagoEm) / 60000)) : 0; }
PAGES.pedido = () => {
  const u = Auth.user();
  if (!u) { location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return; }
  const o = Orders.get(qs('id'));
  const v = view();
  if (!o || o.uid !== u.id) { v.innerHTML = `<div class="empty"><h3>Pedido não encontrado</h3><a class="btn" href="conta.html?tab=pedidos">Meus pedidos</a></div>`; return; }
  const nomes = ['Pedido realizado', 'Pagamento aprovado', 'Em separação', 'Enviado', 'Entregue'];
  const draw = () => {
    const s = etapaPedido(o);
    const pagTxt = { pix: 'Pix', cartao: `Cartão ${o.cartao} em ${o.parcelas}x`, boleto: 'Boleto bancário' }[o.pag];
    let cobranca = '';
    if (!o.pago && o.pag === 'pix') {
      let seed = [...o.id].reduce((a, c) => a + c.charCodeAt(0), 0), cells = '';
      for (let i = 0; i < 441; i++) { seed = (seed * 9301 + 49297) % 233280; cells += `<i class="${seed / 233280 > .5 ? 'w' : ''}"></i>`; }
      cobranca = `<div class="box" style="margin-bottom:18px"><h3>Pague com Pix</h3><div class="pix"><div class="qr">${cells}</div>
        <code>00020126580014BR.GOV.BCB.PIX0136finta-${o.id.toLowerCase()}5204000053039865406${o.total.toFixed(2)}5802BR5905FINTA6009SAO PAULO6304ABCD</code>
        <button class="btn" id="copiar" type="button">Copiar código Pix</button></div>
        <button class="btn sec block" id="simular" style="margin-top:12px">Simular pagamento</button></div>`;
    } else if (!o.pago && o.pag === 'boleto') {
      cobranca = `<div class="box" style="margin-bottom:18px"><h3>Boleto bancário</h3><div class="pix"><p>Vencimento: ${new Date(o.data + 3 * 864e5).toLocaleDateString('pt-BR')}</p><code>34191.79001 01043.510047 91020.150008 5 9${String(Math.round(o.total * 100)).padStart(13, '0')}</code>
        <button class="btn" id="copiar" type="button">Copiar linha digitável</button></div>
        <button class="btn sec block" id="simular" style="margin-top:12px">Simular pagamento</button></div>`;
    }
    v.innerHTML = `
      ${qs('novo') ? `<div class="box" style="text-align:center;margin-bottom:18px;border-color:var(--neon)"><h1 style="font-size:1.6rem">🎉 Pedido confirmado!</h1><p style="color:var(--muted)">Obrigado pela compra, ${esc(u.nome.split(' ')[0])}. Enviamos os detalhes para ${esc(u.email)}.</p></div>` : ''}
      <h1 class="page-t">Pedido <em>#${o.id}</em></h1>
      <div class="timeline">${nomes.map((n, i) => `<div class="tl ${i <= s ? 'done' : ''}"><i></i>${n}</div>`).join('')}</div>
      ${cobranca}
      <div class="layout2">
        <div class="box"><h3>Itens</h3>${o.itens.map(i => `<div class="mini-item"><div class="th">${jerseySVG(prod(i.id))}</div><div class="grow">${esc(i.nome)}<br><small style="color:var(--muted)">Tam. ${i.tam} · ${i.qtd}x ${BRL(i.preco)}</small></div><b>${BRL(i.preco * i.qtd)}</b></div>`).join('')}</div>
        <aside class="box"><h3>Detalhes</h3>
          <div class="sum-line"><span>Data</span><span>${new Date(o.data).toLocaleString('pt-BR')}</span></div>
          <div class="sum-line"><span>Pagamento</span><span>${pagTxt}</span></div>
          <div class="sum-line"><span>Subtotal</span><span>${BRL(o.subtotal)}</span></div>
          ${o.desconto ? `<div class="sum-line"><span>Descontos</span><span class="ok">− ${BRL(o.desconto)}</span></div>` : ''}
          <div class="sum-line"><span>Frete (${o.freteNome})</span><span>${o.frete ? BRL(o.frete) : 'Grátis'}</span></div>
          <div class="sum-line total"><span>Total</span><b>${BRL(o.total)}</b></div>
          <p style="color:var(--muted);font-size:.85rem;margin-top:12px"><b style="color:var(--text)">Entrega:</b> ${esc(o.end.rua)}, ${esc(o.end.num)}${o.end.comp ? ' – ' + esc(o.end.comp) : ''} · ${esc(o.end.bairro)}, ${esc(o.end.cidade)}/${esc(o.end.uf)} · CEP ${esc(o.end.cep)}<br>Prazo: até ${o.prazo} dias úteis</p>
          <a class="btn sec block" style="margin-top:14px" href="conta.html?tab=pedidos">Meus pedidos</a>
        </aside>
      </div>`;
    const sim = $('#simular');
    if (sim) sim.onclick = () => {
      const l = store.get('finta_orders', []); const x = l.find(y => y.id === o.id);
      x.pago = true; x.pagoEm = Date.now(); store.set('finta_orders', l); o.pago = true; o.pagoEm = x.pagoEm;
      toast('Pagamento aprovado ✔'); draw();
    };
    const cp = $('#copiar');
    if (cp) cp.onclick = () => { navigator.clipboard?.writeText($('.pix code').textContent); toast('Copiado!'); };
  };
  draw();
};

/* ================= CONTA ================= */
PAGES.conta = () => {
  const u = Auth.user();
  if (!u) { location.replace('login.html?next=conta.html'); return; }
  let tab = qs('tab') || 'pedidos';
  const v = view();
  const draw = () => {
    const us = Auth.user(), e = us.end;
    const pedidos = Orders.all();
    v.innerHTML = `
      <div class="profile-head"><div class="avatar">${esc(us.nome[0].toUpperCase())}</div>
        <div style="flex:1"><h1>${esc(us.nome)}</h1><p>${esc(us.email)}</p>${e ? `<p>${esc(e.rua)}, ${esc(e.num)} – ${esc(e.bairro)}, ${esc(e.cidade)}/${esc(e.uf)}</p>` : ''}</div>
        <button class="btn sec" id="sair">Sair</button></div>
      <div class="tabs"><button class="tab ${tab === 'pedidos' ? 'on' : ''}" data-t="pedidos">Histórico de pedidos</button><button class="tab ${tab === 'dados' ? 'on' : ''}" data-t="dados">Meus dados</button><button class="tab ${tab === 'senha' ? 'on' : ''}" data-t="senha">Segurança</button></div>
      <div id="tabc"></div>`;
    $('#sair').onclick = () => { Auth.logout(); location.href = 'index.html'; };
    $$('.tab').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
    const c = $('#tabc');
    if (tab === 'pedidos') {
      c.innerHTML = pedidos.length ? pedidos.map(o => {
        const s = etapaPedido(o);
        return `<div class="order"><header><div><b>Pedido #${o.id}</b><div style="color:var(--muted);font-size:.85rem">${new Date(o.data).toLocaleDateString('pt-BR')} · ${o.itens.reduce((a, i) => a + i.qtd, 0)} item(ns)</div></div>
          <div style="text-align:right"><span class="status ${s === 4 ? 'ok' : ''}">${['Aguardando pagamento', 'Pago', 'Em separação', 'Enviado', 'Entregue'][s]}</span><div style="font-weight:800;color:var(--neon);margin-top:4px">${BRL(o.total)}</div></div></header>
          <div style="display:flex;gap:8px;align-items:center">${o.itens.slice(0, 4).map(i => `<div class="th" style="width:52px;background:#150a2b;border-radius:8px;padding:3px">${jerseySVG(prod(i.id))}</div>`).join('')}<a class="btn sec" style="margin-left:auto" href="pedido.html?id=${o.id}">Ver detalhes</a></div></div>`;
      }).join('') : `<div class="empty"><h3>Nenhum pedido ainda</h3><p style="margin-bottom:16px">Quando você comprar, seu histórico aparece aqui.</p><a class="btn" href="index.html?cat=todos">Ir às compras</a></div>`;
    } else if (tab === 'dados') {
      const e2 = us.end || {};
      c.innerHTML = `<form id="fd" class="box form" novalidate>
        <div class="field s3"><label>Nome</label><input name="nome" value="${esc(us.nome)}"><span class="err"></span></div>
        <div class="field s3"><label>E-mail</label><input value="${esc(us.email)}" disabled></div>
        <div class="field s3"><label>CPF</label><input name="cpf" data-mask="cpf" value="${esc(us.cpf)}"><span class="err"></span></div>
        <div class="field s3"><label>Celular</label><input name="tel" data-mask="tel" value="${esc(us.tel)}"></div>
        <div class="field s2"><label>CEP</label><input name="cep" data-mask="cep" value="${esc(e2.cep)}"></div>
        <div class="field s4"><label>Rua</label><input name="rua" value="${esc(e2.rua)}"></div>
        <div class="field s2"><label>Número</label><input name="num" value="${esc(e2.num)}"></div>
        <div class="field s4"><label>Complemento</label><input name="comp" value="${esc(e2.comp)}"></div>
        <div class="field s2"><label>Bairro</label><input name="bairro" value="${esc(e2.bairro)}"></div>
        <div class="field s3"><label>Cidade</label><input name="cidade" value="${esc(e2.cidade)}"></div>
        <div class="field s3"><label>UF</label><input name="uf" maxlength="2" value="${esc(e2.uf)}"></div>
        <div class="field"><button class="btn">Salvar alterações</button></div></form>`;
      bindMasks(c);
      const f = $('#fd');
      f.cep.addEventListener('input', async () => { if (f.cep.value.length === 9) { const r = await buscaCEP(f.cep.value); if (r) { f.rua.value = r.logradouro || ''; f.bairro.value = r.bairro || ''; f.cidade.value = r.localidade || ''; f.uf.value = r.uf || ''; } } });
      f.onsubmit = ev => {
        ev.preventDefault();
        if (f.nome.value.trim().length < 2) return setErr(f.nome, 'Informe seu nome.');
        if (f.cpf.value && !validCPF(f.cpf.value)) return setErr(f.cpf, 'CPF inválido.');
        setErr(f.nome, ''); setErr(f.cpf, '');
        Auth.update({ nome: f.nome.value.trim(), cpf: f.cpf.value, tel: f.tel.value, end: f.rua.value.trim() ? { cep: f.cep.value, rua: f.rua.value.trim(), num: f.num.value.trim(), comp: f.comp.value.trim(), bairro: f.bairro.value.trim(), cidade: f.cidade.value.trim(), uf: f.uf.value.toUpperCase() } : null });
        toast('Dados salvos ✔'); draw();
      };
    } else {
      c.innerHTML = `<form id="fs" class="box form" novalidate style="max-width:460px">
        <div class="field"><label>Senha atual</label><input name="a" type="password"><span class="err"></span></div>
        <div class="field"><label>Nova senha</label><input name="n" type="password"><span class="err"></span></div>
        <div class="field"><button class="btn">Alterar senha</button></div></form>`;
      $('#fs').onsubmit = async ev => {
        ev.preventDefault(); const f = ev.target;
        if (await hash(us.email + f.a.value) !== us.hash) return setErr(f.a, 'Senha atual incorreta.');
        setErr(f.a, ''); if (f.n.value.length < 6) return setErr(f.n, 'Mínimo de 6 caracteres.');
        Auth.update({ hash: await hash(us.email + f.n.value) }); f.reset(); setErr(f.n, ''); toast('Senha alterada ✔');
      };
    }
  };
  draw();
};

document.addEventListener('DOMContentLoaded', () => { const fn = PAGES[document.body.dataset.page]; if (fn) fn(); });
