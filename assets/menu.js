/*
  Menu mobile (hambúrguer) e cards de link (estilos em menu.css).
  - Cria o botão no cabeçalho e o painel do menu em todas as páginas.
  - Preenche qualquer elemento [data-links] com os cards de link (usado na página Sobre mim).
*/
(function () {
  const svg = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
    user: svg('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>'),
    whatsapp: svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 10.5c.5 1.6 1.9 3 3.5 3.5l1.2-1.1 2 .9v1.4c-3.6.5-7.4-3.3-6.9-6.9h1.4l.9 2z" stroke-width="1.4"/>'),
    linkedin: svg('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>'),
    instagram: svg('<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>'),
    arrow: svg('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>'),
    menu: svg('<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>'),
    close: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  };

  const ABOUT = { id: 'sobre', icon: 'user', title: 'Sobre mim', desc: 'Trajetória e experiência', href: 'sobre.html' };
  const LINKS = [
    { id: 'whatsapp', icon: 'whatsapp', title: 'WhatsApp', desc: 'Vamos falar do seu projeto', href: 'https://api.whatsapp.com/send/?phone=5511976625372&text&type=phone_number&app_absent=0' },
    { id: 'linkedin', icon: 'linkedin', title: 'LinkedIn', desc: 'in/victor-brito-designer', href: 'https://www.linkedin.com/in/victor-brito-designer/' },
    { id: 'instagram', icon: 'instagram', title: 'Instagram', desc: '@victorbritodesign', href: 'https://www.instagram.com/victorbritodesign' },
  ];

  const card = l => {
    const external = /^https?:/.test(l.href);
    return `<a class="mcard mcard--${l.id}" href="${l.href.replace(/&/g, '&amp;')}"${external ? ' target="_blank" rel="noopener"' : ''}>
      <span class="mcard__icon">${ICONS[l.icon]}</span>
      <span class="mcard__text"><span class="mcard__title">${l.title}</span><span class="mcard__desc">${l.desc}</span></span>
      <span class="mcard__cta">${ICONS.arrow}</span>
    </a>`;
  };
  const group = (label, items) => `<div class="mcards"><p class="mcards__label">${label}</p>${items.map(card).join('')}</div>`;

  /* cards de link soltos na página (ex.: Sobre mim) */
  document.querySelectorAll('[data-links]').forEach(el => { el.innerHTML = group(el.dataset.links || 'Links', LINKS); });

  /* botão + painel do menu */
  const header = document.querySelector('.site-header .header');
  if (!header) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'menu-btn';
  btn.setAttribute('aria-label', 'Abrir menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'menu-mobile');
  btn.innerHTML = ICONS.menu;
  header.appendChild(btn);

  const menu = document.createElement('div');
  menu.className = 'mmenu';
  menu.id = 'menu-mobile';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Menu');
  menu.innerHTML = `
    <div class="mmenu__head">
      <a href="index.html" aria-label="Início"><img src="assets/logo.png" alt="" width="40" height="40"></a>
      <button type="button" class="menu-btn" aria-label="Fechar menu">${ICONS.close}</button>
    </div>
    <div class="mmenu__profile" style="--i: 1">
      <img class="mmenu__photo" src="assets/foto-perfil.png" alt="Foto de Victor Brito" width="112" height="112">
      <div>
        <p class="mmenu__name">Victor Brito</p>
        <p class="mmenu__role">Product, UX e Visual Designer</p>
      </div>
      <span class="mmenu__status">Disponível para projetos</span>
    </div>
    <div style="--i: 2">${group('Navegação', [ABOUT])}</div>
    <div style="--i: 3">${group('Links', LINKS)}</div>`;
  document.body.appendChild(menu);
  const closeBtn = menu.querySelector('.mmenu__head .menu-btn');

  const open = () => {
    menu.classList.add('is-open');
    document.body.classList.add('menu-open');
    btn.setAttribute('aria-expanded', 'true');
    closeBtn.focus({ preventScroll: true });
  };
  const close = () => {
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.focus({ preventScroll: true });
  };
  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
  /* se a tela crescer com o menu aberto, fecha */
  window.matchMedia('(min-width: 601px)').addEventListener('change', e => { if (e.matches && menu.classList.contains('is-open')) close(); });
})();
