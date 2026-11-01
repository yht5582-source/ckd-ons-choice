(function () {
    'use strict';

    const E = window.CKDONS;
    const { SOURCES, CASES, QUIZ, MAP, runCase } = window.CKDONSTeach;
    const byId = (id) => document.getElementById(id);
    const VIEWS = ['tool', 'cases', 'quiz', 'map'];
    const LETTERS = ['A', 'B', 'C', 'D'];

    const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
    const sourceLinks = (keys) => keys.map((key) => `<a href="${SOURCES[key].url}" target="_blank" rel="noopener">${SOURCES[key].label}</a>`).join('、');

    function scenarioRow(item, scenario, index) {
        const r = runCase(E, item.base, scenario.patch);
        const n = r.state.needs;
        const order = r.ranked.slice(0, 2).map((p) => p.shortName).join(' → ');
        const flag = r.urgent ? '<small class="urgent">立即通知</small>' : '';
        return `<tr><th scope="row">${scenario.label}</th><td>${n.energyMin}–${n.energyMax}</td><td>${n.proteinMin}–${n.proteinMax}</td><td class="order-cell">${order}</td><td>${r.red} 紅／${r.amber} 黃${flag}</td><td><button type="button" class="link-button" data-load-case="${item.id}" data-load-scenario="${index}">帶入工具</button></td></tr>`;
    }

    function renderCases() {
        byId('case-list').innerHTML = CASES.map((item, index) => `
            <article class="case-card" id="case-${item.id}">
                <header><span class="case-number">${index + 1}</span><div><span class="case-tag">${item.tag}</span><h3>${item.title}</h3></div></header>
                <p>${item.stem}</p>
                <ul class="case-facts">${item.facts.map((fact) => `<li>${fact}</li>`).join('')}</ul>
                <p class="case-question"><strong>想一想：</strong>${item.question}</p>
                <div class="table-scroll"><table class="scenario-table"><thead><tr><th scope="col">情境</th><th scope="col">熱量 kcal</th><th scope="col">蛋白質 g</th><th scope="col">排序前兩名</th><th scope="col">警訊</th><th scope="col"><span class="visually-hidden">帶入工具</span></th></tr></thead><tbody>${item.scenarios.map((scenario, i) => scenarioRow(item, scenario, i)).join('')}</tbody></table></div>
                <details class="case-answer"><summary>看判讀與處置思路</summary>
                    <h4>判讀</h4>${list(item.read)}
                    <h4>處置思路</h4>${list(item.plan)}
                    <p class="case-pitfall"><strong>常見陷阱：</strong>${item.pitfall}</p>
                    <p class="source-line">依據：${sourceLinks(item.src)}</p>
                </details>
            </article>`).join('');
    }

    function loadCase(caseId, scenarioIndex) {
        const item = CASES.find((entry) => entry.id === caseId);
        const scenario = item.scenarios[scenarioIndex];
        window.applyValues({ ...item.base, ...scenario.patch });
        byId('demo-banner-text').textContent = `已帶入示範病例：${item.title}（${scenario.label}）。這是虛構資料，請勿當成真實病人。`;
        byId('demo-banner').hidden = false;
        showView('tool');
    }

    const quizState = { filter: '全部', answers: new Map() };

    function renderQuiz() {
        const visible = QUIZ.map((item, index) => ({ item, index }))
            .filter(({ item }) => quizState.filter === '全部' || item.level === quizState.filter);
        const answered = visible.filter(({ index }) => quizState.answers.has(index));
        const correct = answered.filter(({ item, index }) => quizState.answers.get(index) === item.answer).length;
        byId('quiz-score').textContent = `已答 ${answered.length}／${visible.length}，答對 ${correct}`;
        byId('quiz-filter').querySelectorAll('button').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.filter === quizState.filter));
        });
        byId('quiz-list').innerHTML = visible.map(({ item, index }) => {
            const chosen = quizState.answers.get(index);
            const done = chosen !== undefined;
            const options = item.options.map((option, i) => {
                const state = !done ? '' : i === item.answer ? ' is-correct' : i === chosen ? ' is-wrong' : '';
                return `<button type="button" class="quiz-option${state}" data-question="${index}" data-option="${i}"${done ? ' disabled' : ''}><span>${LETTERS[i]}</span><div>${option}</div></button>`;
            }).join('');
            const feedback = done ? `<div class="quiz-feedback ${chosen === item.answer ? 'right' : 'wrong'}" role="status"><strong>${chosen === item.answer ? '答對' : `答錯，正解 ${LETTERS[item.answer]}`}</strong>：${item.why}${item.src.length ? `<span class="source-line">依據：${sourceLinks(item.src)}</span>` : ''}</div>` : '';
            return `<article class="quiz-card"><p class="quiz-stem"><span class="quiz-level ${item.level === '高階' ? 'advanced' : ''}">${item.level}</span><strong>${index + 1}.</strong> ${item.stem}</p><div class="quiz-options">${options}</div>${feedback}</article>`;
        }).join('');
    }

    function renderMap() {
        const half = Math.ceil(MAP.branches.length / 2);
        const branch = (entry, index) => `<details class="mm-branch" data-branch="${index}" open style="--branch:${entry.color}"><summary class="mm-node">${entry.title}</summary><ul>${entry.leaves.map((leaf) => `<li class="mm-leaf">${leaf}</li>`).join('')}</ul></details>`;
        byId('map-body').innerHTML = `<svg class="mm-lines" aria-hidden="true"></svg>
            <div class="mm-side mm-left">${MAP.branches.slice(0, half).map((entry, i) => branch(entry, i)).join('')}</div>
            <div class="mm-center"><strong>${MAP.center[0]}</strong><span>${MAP.center[1]}</span></div>
            <div class="mm-side mm-right">${MAP.branches.slice(half).map((entry, i) => branch(entry, i + half)).join('')}</div>`;
        byId('map-body').querySelectorAll('details').forEach((node) => node.addEventListener('toggle', drawMap));
    }

    function drawMap() {
        const box = byId('map-body');
        const svg = box.querySelector('.mm-lines');
        if (!svg || box.offsetParent === null || getComputedStyle(svg).display === 'none') return;
        const origin = box.getBoundingClientRect();
        svg.setAttribute('width', origin.width);
        svg.setAttribute('height', origin.height);
        const rect = (element) => {
            const r = element.getBoundingClientRect();
            return { left: r.left - origin.left, right: r.right - origin.left, y: r.top - origin.top + r.height / 2 };
        };
        const curve = (x1, y1, x2, y2, color, width) => {
            const mid = (x1 + x2) / 2;
            return `<path d="M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
        };
        const center = rect(box.querySelector('.mm-center'));
        let paths = '';
        box.querySelectorAll('.mm-branch').forEach((node) => {
            const color = MAP.branches[Number(node.dataset.branch)].color;
            const title = rect(node.querySelector('.mm-node'));
            const left = node.parentElement.classList.contains('mm-left');
            paths += left ? curve(center.left, center.y, title.right, title.y, color, 2.5) : curve(center.right, center.y, title.left, title.y, color, 2.5);
            if (!node.open) return;
            node.querySelectorAll('.mm-leaf').forEach((leaf) => {
                const target = rect(leaf);
                paths += left ? curve(title.left, title.y, target.right, target.y, color, 1.25) : curve(title.right, title.y, target.left, target.y, color, 1.25);
            });
        });
        svg.innerHTML = paths;
    }

    function renderSources() {
        const html = Object.values(SOURCES).map((source) => `<li><a href="${source.url}" target="_blank" rel="noopener">${source.cite}</a></li>`).join('');
        document.querySelectorAll('.source-list').forEach((node) => { node.innerHTML = html; });
    }

    function showView(view, updateHash = true) {
        VIEWS.forEach((name) => {
            byId(`view-${name}`).hidden = name !== view;
            const tab = byId(`tab-${name}`);
            tab.classList.toggle('active', name === view);
            tab.setAttribute('aria-current', name === view ? 'page' : 'false');
        });
        if (updateHash) history.replaceState(null, '', view === 'tool' ? location.pathname + location.search : `#${view}`);
        window.scrollTo(0, 0);
        if (view === 'map') drawMap();
    }

    document.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        if (target.dataset.view) showView(target.dataset.view);
        if (target.dataset.loadCase) loadCase(target.dataset.loadCase, Number(target.dataset.loadScenario));
        if (target.dataset.question) {
            quizState.answers.set(Number(target.dataset.question), Number(target.dataset.option));
            renderQuiz();
        }
        if (target.dataset.filter) {
            quizState.filter = target.dataset.filter;
            renderQuiz();
        }
        if (target.dataset.mapAll) {
            byId('map-body').querySelectorAll('details').forEach((node) => { node.open = target.dataset.mapAll === 'open'; });
            drawMap();
        }
        if (target.closest('.quick-actions')) byId('demo-banner').hidden = true;
    });
    byId('demo-clear').addEventListener('click', () => {
        window.resetForm();
        byId('demo-banner').hidden = true;
    });
    byId('quiz-reset').addEventListener('click', () => {
        quizState.answers.clear();
        renderQuiz();
    });
    window.addEventListener('resize', drawMap);
    window.addEventListener('hashchange', () => {
        const view = location.hash.slice(1);
        showView(VIEWS.includes(view) ? view : 'tool', false);
    });

    renderCases();
    renderQuiz();
    renderMap();
    renderSources();
    const initial = location.hash.slice(1);
    showView(VIEWS.includes(initial) ? initial : 'tool', false);
})();
