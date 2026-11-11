https://trabalhocriacao.vercel.app/

# FINTA · Camisas de futebol

Loja de demonstração (pagamentos e pedidos são simulados; os dados ficam no navegador).

## Estrutura

- `index.html` — único HTML. A tela exibida vem do parâmetro `?p=` (`produto`, `carrinho`, `login`, `checkout`, `pedido`, `conta`; sem `p` abre a home).
- `css/style.css` — todo o CSS.
- `js/app.js` — todo o JavaScript (dados dos produtos, carrinho, login e lógica das telas).

## Fotos das camisas

Por padrão cada camisa é um desenho gerado em SVG. Para usar fotos próprias, coloque os arquivos numa pasta `images/`
e preencha o campo `img` do produto em `js/app.js`, por exemplo `img: 'images/flamengo-1.jpg'`.
Se a foto não carregar, o desenho gerado é exibido no lugar.
