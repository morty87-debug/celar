/* ─── Mobile bottom navigation ─── */
(function () {
  var page = location.pathname.split('/').pop() || 'index.html';

  var items = [
    { href: 'index.html',     label: 'Hem',       icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>' },
    { href: 'lektioner.html', label: 'Lektioner', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>' },
    { href: 'druvor.html',    label: 'Druvor',    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="11" r="2"/><circle cx="14.5" cy="11" r="2"/><circle cx="7.5" cy="15" r="2"/><circle cx="12" cy="15" r="2"/><circle cx="16.5" cy="15" r="2"/><circle cx="9.5" cy="19" r="2"/><circle cx="14.5" cy="19" r="2"/><path d="M12 3v6"/><path d="M12 3c2 0 4 1.5 4.5 3"/></svg>' },
    { href: 'quiz.html',      label: 'Quiz',      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 9l2 2 4-4"/><path d="M8 16h8"/><path d="M8 19h5"/></svg>' },
    { href: 'sok.html',       label: 'Sök',       icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>' }
  ];

  var nav = document.createElement('nav');
  nav.className = 'mobile-nav';

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var a = document.createElement('a');
    a.href = it.href;
    a.className = 'mobile-nav-item';
    if (page === it.href || (page === '' && it.href === 'index.html')) {
      a.classList.add('active');
    }
    a.innerHTML = it.icon + '<span>' + it.label + '</span>';
    nav.appendChild(a);
  }

  document.body.appendChild(nav);
})();

/* ─── Theme toggle (dark mode) ─── */
(function () {
  // Apply saved theme immediately
  var saved = localStorage.getItem('cellar-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  var sunIcon = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var moonIcon = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  var btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Växla tema');
  btn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? sunIcon : moonIcon;

  btn.addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('cellar-theme', 'light');
      btn.innerHTML = moonIcon;
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('cellar-theme', 'dark');
      btn.innerHTML = sunIcon;
    }
  });

  document.body.appendChild(btn);
})();
