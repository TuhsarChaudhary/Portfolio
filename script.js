/* ==========================================================================
   Tushar Chaudhary — Portfolio scripts
   Vanilla JS, no dependencies.
   ========================================================================== */

(function () {
    'use strict';

    var EMAIL = 'tusharchaudhary161@gmail.com';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.documentElement;

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ---------- Toast + copy email ---------- */
    var toastEl = document.getElementById('toast');
    var toastText = document.getElementById('toastText');
    var toastTimer;
    function toast(msg) {
        toastText.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
    }

    function copyEmail() {
        var done = function () { toast('Copied ' + EMAIL); };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(EMAIL).then(done, fallback);
        } else {
            fallback();
        }
        function fallback() {
            var ta = document.createElement('textarea');
            ta.value = EMAIL;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); done(); } catch (e) { window.location.href = 'mailto:' + EMAIL; }
            ta.remove();
        }
    }
    document.querySelectorAll('[data-copy-email]').forEach(function (el) {
        el.addEventListener('click', copyEmail);
    });

    /* ---------- Theme ---------- */
    document.getElementById('themeBtn').addEventListener('click', function () {
        var cur = root.getAttribute('data-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        var next = cur === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    });

    /* ---------- Nav: border on scroll, active section ---------- */
    var nav = document.getElementById('nav');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var links = {};
    document.querySelectorAll('#navLinks a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                Object.keys(links).forEach(function (id) { links[id].classList.remove('active'); });
                if (links[entry.target.id]) links[entry.target.id].classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { obs.observe(s); });
    }

    /* ---------- API console ---------- */
    var ENDPOINTS = {
        me: {
            path: '/v1/me',
            body: {
                name: 'Tushar Chaudhary',
                role: 'Software Developer',
                team: 'ITH-UNOV, United Nations',
                office: 'UNDP, New Delhi',
                since: '2025-06',
                languages: ['Python', 'TypeScript', 'SQL'],
                open_to_work: true
            }
        },
        stack: {
            path: '/v1/me/stack',
            body: {
                server: ['FastAPI', 'Express', 'Django'],
                data: ['MongoDB', 'PostgreSQL', 'pandas'],
                ml: ['Sentence-BERT', 'KeyBERT'],
                docs: 'OpenAPI / Swagger',
                ai_tools: ['Claude', 'Cursor']
            }
        },
        now: {
            path: '/v1/me/now',
            body: {
                building: 'SLA sign-off and document parsing on WISH',
                learning: ['Java and Spring Boot', 'Writing better tests'],
                last_commit: '2026-11-19'
            }
        },
        hire: {
            path: '/v1/me/hire',
            body: {
                looking_for: 'Junior Backend / Data Developer',
                location: ['Bangalore', 'Remote'],
                email: EMAIL
            }
        }
    };

    // Turn a value into [text, class] tokens laid out like pretty-printed JSON.
    function tokenize(value, indent) {
        indent = indent || 0;
        var pad = '  '.repeat(indent);
        var padIn = '  '.repeat(indent + 1);
        var out = [];
        if (value === null || typeof value === 'boolean') { out.push([String(value), 'b']); }
        else if (typeof value === 'number') { out.push([String(value), 'n']); }
        else if (typeof value === 'string') { out.push([JSON.stringify(value), 's']); }
        else if (Array.isArray(value)) {
            out.push(['[', '']);
            value.forEach(function (v, i) {
                out = out.concat(tokenize(v, indent + 1));
                if (i < value.length - 1) out.push([', ', '']);
            });
            out.push([']', '']);
        } else {
            var keys = Object.keys(value);
            out.push(['{', '']);
            keys.forEach(function (k, i) {
                out.push(['\n' + padIn, '']);
                out.push([JSON.stringify(k), 'k']);
                out.push([': ', '']);
                out = out.concat(tokenize(value[k], indent + 1));
                if (i < keys.length - 1) out.push([',', '']);
            });
            out.push(['\n' + pad + '}', '']);
        }
        return out;
    }

    function render(tokens, limit) {
        var html = '';
        var used = 0;
        for (var i = 0; i < tokens.length && used < limit; i++) {
            var text = tokens[i][0].slice(0, limit - used);
            html += tokens[i][1] ? '<span class="' + tokens[i][1] + '">' + esc(text) + '</span>' : esc(text);
            used += text.length;
        }
        return html;
    }

    var body = document.getElementById('consoleBody');
    var url = document.getElementById('consoleUrl');
    var time = document.getElementById('consoleTime');
    var tabs = document.querySelectorAll('.console-tab');
    var raf = null;

    function show(name, animate) {
        var ep = ENDPOINTS[name];
        url.innerHTML = '<span class="host">api.tushar.dev</span>' + esc(ep.path);
        time.textContent = (24 + Math.floor(Math.random() * 30)) + ' ms';
        tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.endpoint === name)); });

        var tokens = tokenize(ep.body);
        var total = tokens.reduce(function (n, t) { return n + t[0].length; }, 0);
        if (raf) cancelAnimationFrame(raf);
        if (!animate || reduceMotion) { body.innerHTML = render(tokens, total); return; }

        // Print the response quickly (about 250 ms), like a fast terminal.
        var start = null;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min(1, (ts - start) / 250);
            body.innerHTML = render(tokens, Math.ceil(total * p));
            if (p < 1) raf = requestAnimationFrame(step);
        }
        raf = requestAnimationFrame(step);
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () { show(tab.dataset.endpoint, true); });
    });
    show('me', false);

    /* ---------- Commit heatmap ---------- */
    // Unique commits per day across 13 repos, from local git history (snapshot: 20 Nov 2026).
    var COMMITS = {"2025-08-17":1,"2025-08-18":1,"2025-08-19":1,"2025-08-21":1,"2025-08-22":1,"2025-08-25":1,"2025-08-26":1,"2025-08-27":1,"2025-08-28":3,"2025-08-29":1,"2025-09-09":2,"2025-09-10":1,"2025-09-11":1,"2025-09-12":1,"2025-09-14":1,"2025-09-15":3,"2025-09-16":3,"2025-09-17":1,"2025-09-18":1,"2025-09-19":2,"2025-09-22":2,"2025-09-23":1,"2025-09-24":1,"2025-09-25":1,"2025-09-26":1,"2025-09-28":1,"2025-09-29":2,"2025-09-30":1,"2025-10-01":1,"2025-10-03":1,"2025-10-06":1,"2025-10-07":1,"2025-10-08":1,"2025-10-09":2,"2025-10-10":1,"2025-10-13":1,"2025-10-14":1,"2025-10-16":1,"2025-10-21":2,"2025-10-22":1,"2025-10-24":1,"2025-10-28":1,"2025-10-29":2,"2025-11-03":2,"2025-11-04":5,"2025-11-06":3,"2025-11-07":2,"2025-11-09":1,"2025-11-10":3,"2025-11-11":2,"2025-11-12":5,"2025-11-13":4,"2025-11-14":2,"2025-11-17":1,"2025-11-18":2,"2025-11-20":2,"2025-11-21":1,"2025-11-24":1,"2025-11-26":2,"2025-12-01":2,"2025-12-03":1,"2025-12-18":1,"2026-01-05":1,"2026-02-19":1,"2026-02-23":3,"2026-02-24":5,"2026-02-25":4,"2026-02-26":5,"2026-03-02":2,"2026-03-03":4,"2026-05-06":1,"2026-05-11":2,"2026-05-12":1,"2026-05-14":4,"2026-07-08":1,"2026-07-09":1,"2026-07-10":3,"2026-07-13":2,"2026-07-14":4,"2026-07-17":3,"2026-07-21":1,"2026-07-22":1,"2026-07-23":3,"2026-07-29":4,"2026-07-30":1,"2026-08-07":1,"2026-08-10":3,"2026-08-13":1,"2026-08-14":5,"2026-08-17":1,"2026-08-18":3,"2026-08-19":1,"2026-08-20":3,"2026-08-21":2,"2026-08-24":2,"2026-08-25":4,"2026-08-27":3,"2026-08-31":5,"2026-09-01":4,"2026-09-02":3,"2026-09-03":4,"2026-09-07":1,"2026-09-09":1,"2026-09-10":4,"2026-09-11":1,"2026-09-14":1,"2026-09-15":1,"2026-09-16":1,"2026-09-18":1,"2026-09-21":1,"2026-09-23":1,"2026-09-24":4,"2026-09-28":2,"2026-09-29":1,"2026-09-30":2,"2026-10-09":2,"2026-10-16":3,"2026-10-21":2,"2026-10-22":1,"2026-10-23":8,"2026-10-27":2,"2026-10-28":7,"2026-10-29":2,"2026-11-02":5,"2026-11-03":2,"2026-11-04":1,"2026-11-05":6,"2026-11-13":2,"2026-11-16":5,"2026-11-17":6,"2026-11-19":1};
    var HEAT_END = '2026-11-20';
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var heat = document.getElementById('heatmap');
    var tip = document.getElementById('heatTip');

    function day(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
    function level(n) { return n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4; }

    function drawHeatmap() {
        var width = heat.parentElement.clientWidth;
        var weeks = width < 520 ? 26 : 52;
        var end = day(HEAT_END);
        var first = new Date(end);
        first.setUTCDate(end.getUTCDate() - end.getUTCDay() - (weeks - 1) * 7); // Sunday, `weeks` weeks back

        var cell = 11, gap = 3, left = 26, top = 14;
        heat.setAttribute('viewBox', '0 0 ' + (left + weeks * (cell + gap)) + ' ' + (top + 7 * (cell + gap)));
        var ns = 'http://www.w3.org/2000/svg';
        heat.textContent = '';

        [1, 3, 5].forEach(function (d) {
            var t = document.createElementNS(ns, 'text');
            t.setAttribute('x', 0);
            t.setAttribute('y', top + d * (cell + gap) + cell - 2);
            t.textContent = DAYS[d];
            heat.appendChild(t);
        });

        var lastMonth = -1;
        for (var w = 0; w < weeks; w++) {
            for (var d = 0; d < 7; d++) {
                var dt = new Date(first);
                dt.setUTCDate(first.getUTCDate() + w * 7 + d);
                if (dt > end) continue;
                if (d === 0 && dt.getUTCMonth() !== lastMonth && dt.getUTCDate() <= 7) {
                    lastMonth = dt.getUTCMonth();
                    var m = document.createElementNS(ns, 'text');
                    m.setAttribute('x', left + w * (cell + gap));
                    m.setAttribute('y', 9);
                    m.textContent = MONTHS[lastMonth];
                    heat.appendChild(m);
                }
                var n = COMMITS[dt.toISOString().slice(0, 10)] || 0;
                var r = document.createElementNS(ns, 'rect');
                r.setAttribute('x', left + w * (cell + gap));
                r.setAttribute('y', top + d * (cell + gap));
                r.setAttribute('width', cell);
                r.setAttribute('height', cell);
                r.setAttribute('rx', 2);
                r.setAttribute('fill', 'var(--heat-' + level(n) + ')');
                r.dataset.label = (n ? n + (n === 1 ? ' commit' : ' commits') : 'No commits') + ', ' +
                    dt.getUTCDate() + ' ' + MONTHS[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear();
                heat.appendChild(r);
            }
        }
    }

    if (heat) {
        drawHeatmap();
        var lastWidth = heat.parentElement.clientWidth;
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var w = heat.parentElement.clientWidth;
                if (w !== lastWidth) { lastWidth = w; drawHeatmap(); }
            }, 150);
        });
        heat.addEventListener('mousemove', function (e) {
            if (e.target.tagName !== 'rect') { tip.style.opacity = 0; return; }
            var b = e.target.getBoundingClientRect();
            tip.textContent = e.target.dataset.label;
            tip.style.left = (b.left + b.width / 2) + 'px';
            tip.style.top = b.top + 'px';
            tip.style.opacity = 1;
        });
        heat.addEventListener('mouseleave', function () { tip.style.opacity = 0; });
    }

    /* ---------- Detail tabs on backend projects ---------- */
    document.querySelectorAll('.details').forEach(function (box) {
        var dtabs = box.querySelectorAll('.d-tab');
        dtabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                dtabs.forEach(function (t) {
                    var on = t === tab;
                    t.setAttribute('aria-selected', String(on));
                    document.getElementById(t.dataset.panel).classList.toggle('active', on);
                });
            });
        });
    });

    /* ---------- Footer year ---------- */
    document.getElementById('year').textContent = new Date().getFullYear();
})();
