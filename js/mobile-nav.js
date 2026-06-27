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
