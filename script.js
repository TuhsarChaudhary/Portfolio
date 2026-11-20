/* ==========================================================================
   Tushar Chaudhary — Portfolio scripts
   Vanilla JS, no dependencies.
   ========================================================================== */

(function () {
    'use strict';

    var EMAIL = 'tusharchaudhary161@gmail.com';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.documentElement;

    /* ---------- Storage helpers (may throw in private mode) ---------- */
    function store(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    /* ---------- Toast ---------- */
    var toastEl = document.getElementById('toast');
    var toastText = document.getElementById('toastText');
    var toastTimer;
    function toast(msg) {
        if (!toastEl) return;
        toastText.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
    }

    /* ---------- Copy email ---------- */
    function copyEmail() {
        var done = function () { toast('Email copied: ' + EMAIL); };
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
    function currentTheme() {
        var t = root.getAttribute('data-theme');
        if (t) return t;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function toggleTheme() {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        store('theme', next);
    }
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    /* ---------- Nav: scrolled state, mobile menu, active link ---------- */
    var nav = document.getElementById('nav');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var menuBtn = document.getElementById('menuBtn');
    var navLinks = document.getElementById('navLinks');
    function setMenu(open) {
        navLinks.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
    }
    if (menuBtn) {
        menuBtn.addEventListener('click', function () { setMenu(!navLinks.classList.contains('open')); });
        navLinks.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { setMenu(false); });
        });
    }

    var sectionLinks = {};
    navLinks.querySelectorAll('a').forEach(function (a) { sectionLinks[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
        var activeObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                Object.keys(sectionLinks).forEach(function (id) { sectionLinks[id].classList.remove('active'); });
                var link = sectionLinks[entry.target.id];
                if (link) link.classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { activeObs.observe(s); });
    }

    /* ---------- Reveal on scroll ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if (!reduceMotion && 'IntersectionObserver' in window) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        reveals.forEach(function (el) { revealObs.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- Hero API console ---------- */
    var ENDPOINTS = {
        me: {
            path: '/v1/me',
            body: {
                name: 'Tushar Chaudhary',
                role: 'Backend & Data Developer',
                based_in: 'India',
                open_to: ['Bangalore', 'Remote'],
                languages: ['Python', 'TypeScript', 'SQL'],
                platforms_shipped: 5,
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
                building: 'SLA sign-off + document parsing on WISH',
                learning: ['Java & Spring Boot', 'Writing better tests'],
                last_commit: '2026-11-19',
                coffee: null
            }
        },
        hire: {
            path: '/v1/me/hire',
            body: {
                available: true,
                looking_for: 'Junior Backend / Data Developer',
                location: 'Bangalore or remote',
                email: EMAIL,
                next_step: 'POST /contact'
            }
        }
    };

    // Turn a JS value into a list of [text, className] tokens, formatted like JSON.
    function tokenize(value, indent) {
        indent = indent || 0;
        var pad = '  '.repeat(indent);
        var padIn = '  '.repeat(indent + 1);
        var out = [];
        if (value === null) { out.push(['null', 'b']); }
        else if (typeof value === 'boolean') { out.push([String(value), 'b']); }
        else if (typeof value === 'number') { out.push([String(value), 'n']); }
        else if (typeof value === 'string') { out.push([JSON.stringify(value), 's']); }
        else if (Array.isArray(value)) {
            var flat = value.every(function (v) { return typeof v !== 'object' || v === null; });
            out.push(['[', '']);
            value.forEach(function (v, i) {
                if (!flat) out.push(['\n' + padIn, '']);
                out = out.concat(tokenize(v, indent + 1));
                if (i < value.length - 1) out.push([flat ? ', ' : ',', '']);
            });
            if (!flat) out.push(['\n' + pad, '']);
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

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderTokens(tokens, limit) {
        var html = '';
        var used = 0;
        for (var i = 0; i < tokens.length; i++) {
            var text = tokens[i][0];
            var cls = tokens[i][1];
            if (used + text.length > limit) {
                text = text.slice(0, limit - used);
                html += cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text);
                return html;
            }
            html += cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text);
            used += text.length;
        }
        return html;
    }

    var consoleBody = document.getElementById('consoleBody');
    var consoleUrl = document.getElementById('consoleUrl');
    var consoleTime = document.getElementById('consoleTime');
    var consoleTabs = document.querySelectorAll('.console-tab');
    var typingRaf = null;
    var currentEndpoint = 'me';

    function runEndpoint(name) {
        var ep = ENDPOINTS[name];
        if (!ep || !consoleBody) return;
        currentEndpoint = name;
        consoleUrl.innerHTML = '<span class="host">api.tushar.dev</span>' + esc(ep.path);
        consoleTime.textContent = (22 + Math.floor(Math.random() * 40)) + ' ms';
        consoleTabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.endpoint === name)); });

        var tokens = tokenize(ep.body);
        var total = tokens.reduce(function (n, t) { return n + t[0].length; }, 0);
        if (typingRaf) cancelAnimationFrame(typingRaf);

        if (reduceMotion) {
            consoleBody.innerHTML = renderTokens(tokens, total);
            return;
        }
        var shown = 0;
        var speed = Math.max(4, Math.round(total / 70)); // finish in ~70 frames
        consoleBody.innerHTML = '<span class="caret"></span>';
        function step() {
            shown = Math.min(total, shown + speed);
            consoleBody.innerHTML = renderTokens(tokens, shown) + '<span class="caret"></span>';
            if (shown < total) typingRaf = requestAnimationFrame(step);
            else typingRaf = null;
        }
        // small "network" delay so it feels like a request
        setTimeout(function () { typingRaf = requestAnimationFrame(step); }, 160);
    }

    consoleTabs.forEach(function (tab) {
        tab.addEventListener('click', function () { runEndpoint(tab.dataset.endpoint); });
    });
    var sendBtn = document.getElementById('consoleSend');
    if (sendBtn) sendBtn.addEventListener('click', function () { runEndpoint(currentEndpoint); });
    runEndpoint('me');

    /* ---------- Count-up stats ---------- */
    var counters = document.querySelectorAll('[data-count]');
    function countUp(el) {
        var target = parseInt(el.dataset.count, 10);
        if (reduceMotion || target < 10) { el.textContent = target; return; }
        var start = null;
        var dur = 1100;
        function frame(ts) {
            if (!start) start = ts;
            var p = Math.min(1, (ts - start) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(frame);
        }
        el.textContent = '0';
        requestAnimationFrame(frame);
    }
    if ('IntersectionObserver' in window) {
        var countObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { countUp(entry.target); countObs.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach(function (c) { countObs.observe(c); });
    }

    /* ---------- Commit heatmap ---------- */
    // Unique commits per day, aggregated from local git history across 13 repos.
    var COMMITS = {"2025-08-17":1,"2025-08-18":1,"2025-08-19":1,"2025-08-21":1,"2025-08-22":1,"2025-08-25":1,"2025-08-26":1,"2025-08-27":1,"2025-08-28":3,"2025-08-29":1,"2025-09-09":2,"2025-09-10":1,"2025-09-11":1,"2025-09-12":1,"2025-09-14":1,"2025-09-15":3,"2025-09-16":3,"2025-09-17":1,"2025-09-18":1,"2025-09-19":2,"2025-09-22":2,"2025-09-23":1,"2025-09-24":1,"2025-09-25":1,"2025-09-26":1,"2025-09-28":1,"2025-09-29":2,"2025-09-30":1,"2025-10-01":1,"2025-10-03":1,"2025-10-06":1,"2025-10-07":1,"2025-10-08":1,"2025-10-09":2,"2025-10-10":1,"2025-10-13":1,"2025-10-14":1,"2025-10-16":1,"2025-10-21":2,"2025-10-22":1,"2025-10-24":1,"2025-10-28":1,"2025-10-29":2,"2025-11-03":2,"2025-11-04":5,"2025-11-06":3,"2025-11-07":2,"2025-11-09":1,"2025-11-10":3,"2025-11-11":2,"2025-11-12":5,"2025-11-13":4,"2025-11-14":2,"2025-11-17":1,"2025-11-18":2,"2025-11-20":2,"2025-11-21":1,"2025-11-24":1,"2025-11-26":2,"2025-12-01":2,"2025-12-03":1,"2025-12-18":1,"2026-01-05":1,"2026-02-19":1,"2026-02-23":3,"2026-02-24":5,"2026-02-25":4,"2026-02-26":5,"2026-03-02":2,"2026-03-03":4,"2026-05-06":1,"2026-05-11":2,"2026-05-12":1,"2026-05-14":4,"2026-07-08":1,"2026-07-09":1,"2026-07-10":3,"2026-07-13":2,"2026-07-14":4,"2026-07-17":3,"2026-07-21":1,"2026-07-22":1,"2026-07-23":3,"2026-07-29":4,"2026-07-30":1,"2026-08-07":1,"2026-08-10":3,"2026-08-13":1,"2026-08-14":5,"2026-08-17":1,"2026-08-18":3,"2026-08-19":1,"2026-08-20":3,"2026-08-21":2,"2026-08-24":2,"2026-08-25":4,"2026-08-27":3,"2026-08-31":5,"2026-09-01":4,"2026-09-02":3,"2026-09-03":4,"2026-09-07":1,"2026-09-09":1,"2026-09-10":4,"2026-09-11":1,"2026-09-14":1,"2026-09-15":1,"2026-09-16":1,"2026-09-18":1,"2026-09-21":1,"2026-09-23":1,"2026-09-24":4,"2026-09-28":2,"2026-09-29":1,"2026-09-30":2,"2026-10-09":2,"2026-10-16":3,"2026-10-21":2,"2026-10-22":1,"2026-10-23":8,"2026-10-27":2,"2026-10-28":7,"2026-10-29":2,"2026-11-02":5,"2026-11-03":2,"2026-11-04":1,"2026-11-05":6,"2026-11-13":2,"2026-11-16":5,"2026-11-17":6,"2026-11-19":1};
    var HEAT_START = '2025-08-01';
    var HEAT_END = '2026-11-21';
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function parseDay(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
    function fmtKey(d) { return d.toISOString().slice(0, 10); }
    function level(n) { return n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4; }

    var heatSvg = document.getElementById('heatmap');
    var heatTip = document.getElementById('heatTip');

    function renderHeatmap() {
        if (!heatSvg) return;
        var width = heatSvg.parentElement.clientWidth;
        var end = parseDay(HEAT_END);
        var start = parseDay(HEAT_START);
        start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // back to Sunday
        var totalWeeks = Math.ceil(((end - start) / 86400000 + 1) / 7);
        // On narrow screens show fewer weeks so cells stay readable.
        var maxWeeks = width < 520 ? 26 : width < 820 ? 44 : totalWeeks;
        var weeks = Math.min(totalWeeks, maxWeeks);
        var first = new Date(start);
        first.setUTCDate(first.getUTCDate() + (totalWeeks - weeks) * 7);

        var cell = 11, gap = 3, left = 28, top = 16;
        var w = left + weeks * (cell + gap);
        var h = top + 7 * (cell + gap);
        heatSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

        var ns = 'http://www.w3.org/2000/svg';
        while (heatSvg.firstChild) heatSvg.removeChild(heatSvg.firstChild);

        [1, 3, 5].forEach(function (d) {
            var t = document.createElementNS(ns, 'text');
            t.setAttribute('x', 0);
            t.setAttribute('y', top + d * (cell + gap) + cell - 2);
            t.textContent = DAYS[d];
            heatSvg.appendChild(t);
        });

        var lastMonth = -1;
        var shownCommits = 0;
        for (var wk = 0; wk < weeks; wk++) {
            for (var d = 0; d < 7; d++) {
                var day = new Date(first);
                day.setUTCDate(first.getUTCDate() + wk * 7 + d);
                if (day > end) continue;
                if (d === 0 && day.getUTCDate() <= 7 && day.getUTCMonth() !== lastMonth) {
                    lastMonth = day.getUTCMonth();
                    var mt = document.createElementNS(ns, 'text');
                    mt.setAttribute('x', left + wk * (cell + gap));
                    mt.setAttribute('y', 10);
                    mt.textContent = MONTHS[lastMonth] + (lastMonth === 0 ? ' ’' + String(day.getUTCFullYear()).slice(2) : '');
                    heatSvg.appendChild(mt);
                }
                var key = fmtKey(day);
                var n = COMMITS[key] || 0;
                shownCommits += n;
                var r = document.createElementNS(ns, 'rect');
                r.setAttribute('x', left + wk * (cell + gap));
                r.setAttribute('y', top + d * (cell + gap));
                r.setAttribute('width', cell);
                r.setAttribute('height', cell);
                r.setAttribute('rx', 2);
                r.setAttribute('fill', 'var(--heat-' + level(n) + ')');
                r.dataset.label = (n === 0 ? 'No commits' : n + (n === 1 ? ' commit' : ' commits')) + ' · ' +
                    DAYS[day.getUTCDay()] + ', ' + day.getUTCDate() + ' ' + MONTHS[day.getUTCMonth()] + ' ' + day.getUTCFullYear();
                heatSvg.appendChild(r);
            }
        }
        heatSvg.setAttribute('aria-label', 'Commit heatmap: ' + shownCommits + ' commits over the last ' + weeks + ' weeks shown');
    }

    if (heatSvg) {
        renderHeatmap();
        var resizeTimer;
        var lastW = heatSvg.parentElement.clientWidth;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var w = heatSvg.parentElement.clientWidth;
                if (w !== lastW) { lastW = w; renderHeatmap(); }
            }, 150);
        });
        heatSvg.addEventListener('mousemove', function (e) {
            var t = e.target;
            if (t.tagName !== 'rect') { heatTip.style.opacity = 0; return; }
            heatTip.textContent = t.dataset.label;
            var b = t.getBoundingClientRect();
            heatTip.style.left = (b.left + b.width / 2) + 'px';
            heatTip.style.top = b.top + 'px';
            heatTip.style.opacity = 1;
        });
        heatSvg.addEventListener('mouseleave', function () { heatTip.style.opacity = 0; });
    }

    /* ---------- Project filters ---------- */
    var filterBtns = document.querySelectorAll('.filter');
    var projects = document.querySelectorAll('.project');
    var groups = document.querySelectorAll('.group-label');

    function catsOf(el) { return (el.dataset.cat || '').split(/\s+/); }

    filterBtns.forEach(function (btn) {
        var f = btn.dataset.filter;
        var count = 0;
        projects.forEach(function (p) { if (f === 'all' || catsOf(p).indexOf(f) > -1) count++; });
        btn.querySelector('.count').textContent = count;
    });

    function applyFilter(f) {
        filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === f)); });
        projects.forEach(function (p) {
            var show = f === 'all' || catsOf(p).indexOf(f) > -1;
            p.classList.toggle('is-hidden', !show);
            if (show) p.classList.add('in');
        });
        // Hide a group heading (and its grid) when nothing inside it is visible.
        groups.forEach(function (g) {
            var container = g.nextElementSibling;
            var items = [];
            var el = g.nextElementSibling;
            while (el && !el.classList.contains('group-label')) {
                if (el.classList.contains('project')) items.push(el);
                else items = items.concat(Array.prototype.slice.call(el.querySelectorAll('.project')));
                el = el.nextElementSibling;
            }
            var anyVisible = items.some(function (i) { return !i.classList.contains('is-hidden'); });
            g.classList.toggle('is-hidden', !anyVisible);
            if (container && !container.classList.contains('project')) container.style.display = anyVisible ? '' : 'none';
        });
    }
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () { applyFilter(btn.dataset.filter); });
    });

    /* ---------- Visual tabs inside project cards ---------- */
    document.querySelectorAll('.case-visual').forEach(function (wrap) {
        var tabs = wrap.querySelectorAll('.v-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) {
                    var on = t === tab;
                    t.setAttribute('aria-selected', String(on));
                    var panel = document.getElementById(t.dataset.panel);
                    if (panel) panel.classList.toggle('active', on);
                });
            });
        });
    });

    /* ---------- Request-lifecycle animation ---------- */
    function animateFlow(flow) {
        var steps = flow.querySelectorAll('.flow-step');
        if (reduceMotion) { steps.forEach(function (s) { s.classList.add('lit'); }); return; }
        var i = 0;
        function tick() {
            if (i === 0) steps.forEach(function (s) { s.classList.remove('lit'); });
            if (i < steps.length) { steps[i].classList.add('lit'); i++; setTimeout(tick, 280); }
            else { i = 0; setTimeout(tick, 2200); }
        }
        tick();
    }

    function animateStages(wrap) {
        var stages = wrap.querySelectorAll('.mv-stage');
        var lines = wrap.querySelectorAll('.mv-line');
        if (reduceMotion) {
            stages.forEach(function (s) { s.classList.add('done'); });
            lines.forEach(function (l) { l.style.setProperty('--fill', 1); });
            return;
        }
        var i = 0;
        function tick() {
            if (i === 0) {
                stages.forEach(function (s) { s.classList.remove('done'); });
                lines.forEach(function (l) { l.style.setProperty('--fill', 0); });
            }
            if (i < stages.length) {
                stages[i].classList.add('done');
                if (lines[i - 1]) lines[i - 1].style.setProperty('--fill', 1);
                i++;
                setTimeout(tick, 650);
            } else {
                i = 0;
                setTimeout(tick, 2400);
            }
        }
        tick();
    }

    if ('IntersectionObserver' in window) {
        var animObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                if (entry.target.hasAttribute('data-flow')) animateFlow(entry.target);
                if (entry.target.hasAttribute('data-stages')) animateStages(entry.target);
                animObs.unobserve(entry.target);
            });
        }, { threshold: 0.4 });
        document.querySelectorAll('[data-flow], [data-stages]').forEach(function (el) { animObs.observe(el); });
    }

    /* ---------- Command palette ---------- */
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    if (isMac) document.querySelectorAll('.mod-key').forEach(function (k) { k.textContent = '⌘'; });

    function go(hash) {
        var el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
    function open(url) { window.open(url, '_blank', 'noopener'); }

    var COMMANDS = [
        { group: 'Sections', label: 'About', icon: 'i-user', run: function () { go('#about'); } },
        { group: 'Sections', label: 'Experience', icon: 'i-briefcase', run: function () { go('#experience'); } },
        { group: 'Sections', label: 'Projects', icon: 'i-layers', run: function () { go('#projects'); } },
        { group: 'Sections', label: 'Tech stack', icon: 'i-terminal', run: function () { go('#stack'); } },
        { group: 'Sections', label: 'Contact', icon: 'i-mail', run: function () { go('#contact'); } },
        { group: 'Projects', label: 'Clean Milk API', hint: 'Node · MongoDB', icon: 'i-server', run: function () { go('#clean-milk'); } },
        { group: 'Projects', label: 'SortCV', hint: 'FastAPI · ML', icon: 'i-server', run: function () { go('#sortcv'); } },
        { group: 'Projects', label: 'WISH', hint: 'UNOV', icon: 'i-layers', run: function () { go('#wish'); } },
        { group: 'Projects', label: 'UNODC Transparency Portal', hint: 'UNODC', icon: 'i-chart', run: function () { go('#transparency-portal'); } },
        { group: 'Projects', label: 'SOMA', hint: 'EdTech', icon: 'i-layout', run: function () { go('#soma'); } },
        { group: 'Projects', label: 'AnimeKyojin API', hint: 'Django', icon: 'i-db', run: function () { go('#animekyojin'); } },
        { group: 'Actions', label: 'Copy email address', hint: EMAIL, icon: 'i-copy', run: copyEmail },
        { group: 'Actions', label: 'Send an email', icon: 'i-mail', run: function () { window.location.href = 'mailto:' + EMAIL; } },
        { group: 'Actions', label: 'Toggle light / dark theme', icon: 'i-moon', run: toggleTheme },
        { group: 'Links', label: 'GitHub', hint: '@TuhsarChaudhary', icon: 'i-github', fill: true, run: function () { open('https://github.com/TuhsarChaudhary'); } },
        { group: 'Links', label: 'LinkedIn', icon: 'i-linkedin', fill: true, run: function () { open('https://www.linkedin.com/in/tushar-chaudhary-635781203/'); } }
    ];

    var palette = document.getElementById('palette');
    var pInput = document.getElementById('paletteInput');
    var pList = document.getElementById('paletteList');
    var filtered = COMMANDS;
    var selected = 0;
    var lastFocus = null;

    function matches(cmd, q) {
        if (!q) return true;
        var hay = (cmd.label + ' ' + (cmd.hint || '') + ' ' + cmd.group).toLowerCase();
        return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
    }

    function renderPalette() {
        var q = pInput.value.trim();
        filtered = COMMANDS.filter(function (c) { return matches(c, q); });
        if (selected >= filtered.length) selected = Math.max(0, filtered.length - 1);
        if (!filtered.length) {
            pList.innerHTML = '<div class="palette-empty">No results for “' + esc(q) + '”</div>';
            return;
        }
        var html = '';
        var lastGroup = '';
        filtered.forEach(function (c, i) {
            if (c.group !== lastGroup) { html += '<div class="palette-group">' + c.group + '</div>'; lastGroup = c.group; }
            html += '<button class="palette-item' + (i === selected ? ' selected' : '') + '" role="option" aria-selected="' + (i === selected) + '" data-i="' + i + '">' +
                '<svg class="icon' + (c.fill ? ' icon-fill' : '') + '"><use href="#' + c.icon + '"/></svg>' +
                '<span>' + esc(c.label) + '</span>' +
                (c.hint ? '<span class="hint">' + esc(c.hint) + '</span>' : '') +
                '</button>';
        });
        pList.innerHTML = html;
        var sel = pList.querySelector('.selected');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
    }

    function openPalette() {
        lastFocus = document.activeElement;
        palette.classList.add('open');
        pInput.value = '';
        selected = 0;
        renderPalette();
        setTimeout(function () { pInput.focus(); }, 10);
        document.body.style.overflow = 'hidden';
    }
    function closePalette() {
        palette.classList.remove('open');
        document.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function runSelected(i) {
        var cmd = filtered[i];
        if (!cmd) return;
        closePalette();
        setTimeout(cmd.run, 30);
    }

    document.getElementById('paletteBtn').addEventListener('click', openPalette);
    pInput.addEventListener('input', function () { selected = 0; renderPalette(); });
    pList.addEventListener('click', function (e) {
        var item = e.target.closest('.palette-item');
        if (item) runSelected(+item.dataset.i);
    });
    pList.addEventListener('mousemove', function (e) {
        var item = e.target.closest('.palette-item');
        if (item && +item.dataset.i !== selected) { selected = +item.dataset.i; renderPalette(); }
    });
    palette.addEventListener('click', function (e) { if (e.target === palette) closePalette(); });

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            palette.classList.contains('open') ? closePalette() : openPalette();
            return;
        }
        if (!palette.classList.contains('open')) {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) setMenu(false);
            return;
        }
        if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); selected = (selected + 1) % Math.max(1, filtered.length); renderPalette(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selected = (selected - 1 + filtered.length) % Math.max(1, filtered.length); renderPalette(); }
        else if (e.key === 'Enter') { e.preventDefault(); runSelected(selected); }
        else if (e.key === 'Tab') { e.preventDefault(); pInput.focus(); }
    });

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
