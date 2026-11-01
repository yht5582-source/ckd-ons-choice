(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.CKDONSTeach = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const SOURCES = {
        kdoqi: { label: 'KDOQI 2020', url: 'https://www.ajkd.org/article/S0272-6386(20)30726-5/fulltext', cite: 'Ikizler TA, et al. KDOQI Clinical Practice Guideline for Nutrition in CKD: 2020 Update. Am J Kidney Dis 2020;76(3 Suppl 1):S1–S107.' },
        kdigo: { label: 'KDIGO 2024', url: 'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf', cite: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD（Rec 3.3.1.1；PP 3.3.1.1–3.3.1.5）。' },
        isrnm: { label: 'ISRNM PEW 標準（轉載）', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4222262/table/T1', cite: 'ISRNM 透析病人 PEW 臨床診斷標準，引自 ACTINUT 試驗計畫書 Table 1（標準原出處為 Fouque 2008，本次未直接閱讀原文）。' },
        aspen: { label: 'ASPEN 2020', url: 'https://aspenjournals.onlinelibrary.wiley.com/doi/full/10.1002/ncp.10474', cite: 'da Silva JSV, et al. ASPEN Consensus Recommendations for Refeeding Syndrome. Nutr Clin Pract 2020;35:178–195.' }
    };

    // 欄位名稱 = 決策工具的表單 id，可直接帶入工具。
    function runCase(E, base, patch) {
        const v = { ...base, ...(patch || {}) };
        const proteinTarget = E.getProteinTarget(v.dialysis, v['pd-protein-status']);
        const body = E.computeBody(v.gender, E.num(v.height), E.num(v.weight));
        const state = {
            age: E.num(v.age), dialysis: v.dialysis, pdProteinStatus: v['pd-protein-status'], proteinTarget, body,
            needs: body.valid ? E.computeNeeds(body.ibw, proteinTarget) : null,
            appetite: v.appetite, dm: v.dm, hba1c: E.num(v.hba1c), alb: E.num(v.alb), na: E.num(v.na),
            k: E.num(v.k), ca: E.num(v.ca), p: E.num(v.p)
        };
        const alerts = E.buildAlerts(state);
        return {
            state,
            ranked: E.rankProducts(state.dialysis, state.appetite, state.k, state.p),
            red: alerts.filter((a) => a.type === 'red').length,
            amber: alerts.filter((a) => a.type === 'amber').length,
            urgent: alerts.some((a) => a.text.includes('立即通知醫師'))
        };
    }

    // 表格由引擎即時計算；expect 由 tests/teach.test.js 核對，內文數字改動時要一起改。
    const CASES = [
        {
            id: 'ndd-dm',
            title: '未透析合併糖尿病：排第一的不一定最適合',
            tag: '未透析・血糖',
            stem: '72 歲男性，CKD 第 5 期未透析，第 2 型糖尿病。近 2 個月食慾下降。三日飲食紀錄：每日約 1450 kcal、蛋白質 42 g。',
            facts: ['168 cm／62 kg', 'HbA1c 7.8%', 'Alb 3.9', 'K 4.6', 'P 4.8', 'Na 137', 'Ca 9.0'],
            question: '工具把倍速力排在第一，警訊卻建議勝補納或慎選 1。該聽哪一個？',
            base: { age: 72, gender: 'male', height: 168, weight: 62, dialysis: 'ndd', 'pd-protein-status': 'stable', appetite: 'decreased', dm: 'yes', hba1c: 7.8, alb: 3.9, na: 137, k: 4.6, ca: 9.0, p: 4.8 },
            scenarios: [
                { label: '目前狀況', patch: {}, expect: { energy: [1848, 2156], protein: [37, 49.3], top: 'fresubin_renal', red: 1, amber: 3, urgent: false } },
                { label: '食慾恢復', patch: { appetite: 'normal' }, expect: { energy: [1848, 2156], protein: [37, 49.3], top: 'yinengchong', red: 0, amber: 3, urgent: false } },
                { label: '血鉀升到 5.6', patch: { k: 5.6 }, expect: { energy: [1848, 2156], protein: [37, 49.3], top: 'fresubin_renal', red: 2, amber: 3, urgent: false } }
            ],
            read: [
                '<b>排序只看劑型，再看高鉀與高磷，不看血糖。</b>糖尿病只影響警訊文字，所以排序第一的倍速力不屬於工具標記的低 GI 產品。',
                '<b>蛋白質空間只剩 7.3 g：</b>上限 49.3 − 已吃 42 = 7.3 g。倍速力 6 g 放得下（合計 48 g）；勝補納或慎選 1 的 10.6 g 會到 52.6 g，超過上限。',
                '<b>熱量缺口：</b>距下限 1848 還差約 400 kcal，一瓶倍速力剛好 400 kcal。'
            ],
            plan: [
                '兩條路都合理：喝倍速力並追蹤血糖，或改低 GI 配方，同時從正餐減少約 3.3 g 蛋白質。請與個案和營養師討論後決定。',
                'KDOQI 3.0.2 對 CKD 3–5 合併糖尿病的 0.6–0.8 g/kg 屬專家意見（OPINION），且要在密切監測下執行。',
                '工具的蛋白質與熱量是用理想體重算的。KDOQI 的條文只寫 body weight，並提醒各種體重參考值都有限制。'
            ],
            pitfall: '把「🌟 首選」當成最終處方。它只代表劑型符合，血糖和蛋白質空間要自己再看一次。',
            src: ['kdoqi']
        },
        {
            id: 'ndd-k',
            title: '未透析、食慾正常，只差熱量又有高血鉀',
            tag: '未透析・高血鉀',
            stem: '62 歲女性，CKD 第 5 期未透析，無糖尿病，代謝穩定，體重穩定。每日約 1300 kcal、蛋白質 30 g，血鉀 5.4。',
            facts: ['155 cm／50 kg', 'Alb 4.0', 'K 5.4', 'P 5.0', 'Na 139', 'Ca 9.1'],
            question: '工具的蛋白目標是 30.6–40.8 g。KDOQI 對無糖尿病者的建議換算後是多少？她該補什麼？',
            base: { age: 62, gender: 'female', height: 155, weight: 50, dialysis: 'ndd', 'pd-protein-status': 'stable', appetite: 'normal', dm: 'no', hba1c: '', alb: 4.0, na: 139, k: 5.4, ca: 9.1, p: 5.0 },
            scenarios: [
                { label: '目前狀況', patch: {}, expect: { energy: [1530, 1785], protein: [30.6, 40.8], top: 'yinengchong', red: 1, amber: 2, urgent: false } },
                { label: '血鉀降到 4.5', patch: { k: 4.5 }, expect: { energy: [1530, 1785], protein: [30.6, 40.8], top: 'yinengchong', red: 0, amber: 2, urgent: false } },
                { label: '轉為食慾下降', patch: { appetite: 'decreased' }, expect: { energy: [1530, 1785], protein: [30.6, 40.8], top: 'fresubin_renal', red: 2, amber: 2, urgent: false } }
            ],
            read: [
                '<b>工具與指引不同：</b>工具不分有無糖尿病，一律 0.6–0.8 g/kg。KDOQI 3.0.1 對無糖尿病、代謝穩定者是 0.55–0.60 g/kg，以 51 kg 換算為 28.1–30.6 g。KDIGO 2024 則建議 CKD G3–G5 維持 0.8 g/kg（2C）。',
                '<b>她現在吃的 30 g 落在 KDOQI 範圍內</b>，不需要再補蛋白質。',
                '<b>熱量門檻也不同：</b>工具下限 30 kcal/kg（1530 kcal），KDOQI 3.1.1 為 25–35 kcal/kg（1275–1785 kcal），並依年齡、活動量等個別化。'
            ],
            plan: [
                '若判定熱量不足，易能充一包加 200 kcal、0.8 g 蛋白質、108 mg 鉀，補完約 1500 kcal、30.8 g。',
                '高血鉀應一併檢視飲食、藥物與其他原因。KDOQI 6.4.2 指出鉀攝取應依個別需求與臨床判斷（2D）。'
            ],
            pitfall: '看到 ONS 就想到補蛋白。未透析者常常缺的是熱量，蛋白質已經到頂。',
            src: ['kdoqi', 'kdigo']
        },
        {
            id: 'hd-pew',
            title: '血液透析消瘦：白蛋白低就等於 PEW 嗎？',
            tag: '血液透析・PEW',
            stem: '62 歲女性，規則血液透析。半年來吃得少，近 3 個月的飲食紀錄約 22 kcal/kg、蛋白質 0.7 g/kg（理想體重計）。肌肉量尚未測量。',
            facts: ['158 cm／48 kg', 'BMI 19.2', 'Alb 3.2', 'K 5.2', 'P 5.8', 'Na 135', 'Ca 8.8'],
            question: '她符合 ISRNM 的 PEW 標準嗎？一瓶液劑加一包粉劑能補足多少，又會帶進多少鉀和磷？',
            base: { age: 62, gender: 'female', height: 158, weight: 48, dialysis: 'hd', 'pd-protein-status': 'stable', appetite: 'decreased', dm: 'no', hba1c: '', alb: 3.2, na: 135, k: 5.2, ca: 8.8, p: 5.8 },
            scenarios: [
                { label: '目前狀況', patch: {}, expect: { energy: [1584, 1848], protein: [63.4, 73.9], top: 'shengli2', red: 4, amber: 1, urgent: false } },
                { label: '調整透析與結合劑後 K 4.6、P 4.9', patch: { k: 4.6, p: 4.9 }, expect: { energy: [1584, 1848], protein: [63.4, 73.9], top: 'shengli2', red: 2, amber: 1, urgent: false } },
                { label: '食慾恢復', patch: { appetite: 'normal' }, expect: { energy: [1584, 1848], protein: [63.4, 73.9], top: 'yuanqiqiang', red: 3, amber: 1, urgent: false } }
            ],
            read: [
                '<b>ISRNM 要四類中至少三類：</b>血清（Alb &lt;3.8）、身體質量（BMI &lt;23）、飲食（蛋白質 &lt;0.8 g/kg、熱量 &lt;25 kcal/kg 持續至少 2 個月）都符合，已達三類。若沒有飲食紀錄，只靠白蛋白和 BMI 只有兩類，還不能診斷。理想上每項應相隔 2–4 週記錄至少三次。',
                '<b>工具與指引不同：</b>工具 HD 用 1.2–1.4 g/kg（63.4–73.9 g）。KDOQI 3.0.3 對代謝穩定者是 1.0–1.2 g/kg（52.8–63.4 g）。她不算穩定，條文不能直接套用，個別目標請由團隊決定。',
                '<b>組合計算（本頁內建值）：</b>勝力 2＋元氣強 = 529 kcal、27.5 g、鉀 270.8 mg、磷 236 mg。目前約 1162 kcal、37 g，補完約 1691 kcal、64.5 g。',
                '校正鈣 = 8.8 + 0.8 × (4 − 3.2) = 9.4，工具不會跳低血鈣。'
            ],
            plan: [
                'KDOQI 4.1.1：飲食諮詢仍不足時，建議 ONS 至少試 3 個月（2D）。',
                '補充同時追蹤鉀、磷，並檢視磷結合劑與透析處方。KDOQI 1.2.1 也提醒，白蛋白受非營養因素影響，不應單獨判讀。',
                '仍無法達標時，KDOQI 4.1.2 可考慮管灌試驗（OPINION），PEW 者 4.1.3 可試 IDPN（2C）。'
            ],
            pitfall: '工具的白蛋白紅色警訊只是風險提示，不是 PEW 診斷。要先排除感染和發炎等非營養因素。',
            src: ['kdoqi', 'isrnm']
        },
        {
            id: 'pd-peritonitis',
            title: '腹膜炎的 PD 病人：同一個人三種蛋白目標',
            tag: '腹膜透析・低血鉀',
            stem: '58 歲男性，腹膜透析，第 2 型糖尿病。腹膜炎治療中，食慾差，白蛋白 2.9，血鉀 3.1。團隊估計他每日從透析液吸收的葡萄糖約 400 kcal。',
            facts: ['170 cm／65 kg', 'HbA1c 8.1%', 'Alb 2.9', 'K 3.1', 'P 3.6', 'Na 134', 'Ca 7.8'],
            question: '蛋白質分層要選哪一格？低血鉀時還要挑低鉀配方嗎？熱量目標該怎麼扣？',
            base: { age: 58, gender: 'male', height: 170, weight: 65, dialysis: 'pd', 'pd-protein-status': 'catabolic', appetite: 'decreased', dm: 'yes', hba1c: 8.1, alb: 2.9, na: 134, k: 3.1, ca: 7.8, p: 3.6 },
            scenarios: [
                { label: 'PEW／腹膜炎／高分解', patch: {}, expect: { energy: [1890, 2205], protein: [81.9, 94.5], top: 'shengli2', red: 3, amber: 4, urgent: false } },
                { label: '持續腹膜蛋白流失', patch: { 'pd-protein-status': 'protein_loss' }, expect: { energy: [1890, 2205], protein: [75.6, 81.9], top: 'shengli2', red: 2, amber: 4, urgent: false } },
                { label: '恢復穩定', patch: { 'pd-protein-status': 'stable' }, expect: { energy: [1890, 2205], protein: [63, 75.6], top: 'shengli2', red: 2, amber: 4, urgent: false } }
            ],
            read: [
                '<b>分層標示來源：</b>穩定期 1.0–1.2 g/kg 是 KDOQI 3.0.3（PD 為 OPINION）。1.2–1.3 與 1.3–1.5 是工具內建的起始估算，不是 KDOQI 的條文。',
                '<b>低血鉀：</b>工具提示不需刻意選極低鉀配方。元氣強的「極低鉀」賣點對他不是優勢。',
                '<b>熱量要自己扣：</b>工具只提醒，不會計算。1890–2205 kcal 扣掉題幹假設的 400 kcal，經口目標約 1490–1805 kcal。',
                '<b>校正鈣：</b>7.8 + 0.8 × 1.1 = 8.7，未低於工具的 8.4 門檻。'
            ],
            plan: [
                '工具標記的低 GI 只有普寧勝；排序第一的勝力 2 不屬於此類。血糖差時要留意透析液葡萄糖負荷。',
                '腹膜炎好轉後，要回頭改分層，不要一直停在高分解目標。',
                'KDOQI 4.2.1 建議不要把胺基酸透析液當成改善營養的常規替代；口服與管灌都不夠時才考慮試用。'
            ],
            pitfall: '熱量需求直接照工具顯示值開立。PD 的葡萄糖吸收量因人而異，工具沒有這個輸入欄。',
            src: ['kdoqi']
        },
        {
            id: 'hd-hyperk',
            title: '血鉀 6.3：先處理病人，再挑營養品',
            tag: '血液透析・急性警訊',
            stem: '55 歲男性，規則血液透析，週末多吃了水果，透析前血鉀 6.3、血磷 7.2。食慾正常，體重偏重，來詢問能不能喝高蛋白營養品。',
            facts: ['172 cm／78 kg', 'BMI 26.4', 'Alb 3.9', 'K 6.3', 'P 7.2', 'Na 138', 'Ca 9.4'],
            question: '工具把元氣強列為食慾正常首選。現在第一步是選產品嗎？',
            base: { age: 55, gender: 'male', height: 172, weight: 78, dialysis: 'hd', 'pd-protein-status': 'stable', appetite: 'normal', dm: 'no', hba1c: '', alb: 3.9, na: 138, k: 6.3, ca: 9.4, p: 7.2 },
            scenarios: [
                { label: '目前 K 6.3', patch: {}, expect: { energy: [1932, 2254], protein: [77.3, 90.2], top: 'yuanqiqiang', red: 2, amber: 1, urgent: true } },
                { label: '假設 K 5.4', patch: { k: 5.4 }, expect: { energy: [1932, 2254], protein: [77.3, 90.2], top: 'yuanqiqiang', red: 2, amber: 1, urgent: false } },
                { label: '假設 K 4.8、P 5.0', patch: { k: 4.8, p: 5.0 }, expect: { energy: [1932, 2254], protein: [77.3, 90.2], top: 'yuanqiqiang', red: 0, amber: 1, urgent: false } }
            ],
            read: [
                '<b>K ≥ 6.0 是工具的立即通知門檻</b>：要先評估心電圖與降鉀處置，營養品選擇排在後面。',
                '<b>此人沒有 ONS 適應症的證據：</b>食慾正常、Alb 3.9、BMI 26.4。KDOQI 4.1.1 的 ONS 試驗對象是 PEW 或有風險、且飲食諮詢仍不足的人。',
                '<b>體重基準：</b>實際體重是 IBW 的 121%，工具提示肥胖個案可改用調整體重。KDOQI 也提醒，調整體重未在 CKD 驗證，可能高估或低估需求。'
            ],
            plan: [
                '急性處置後，再回頭看飲食鉀來源與透析是否足夠。',
                'KDOQI 6.3.1 建議調整飲食磷以維持血磷正常（1B），6.3.2 建議考量來源的生物利用度。',
                '血磷 7.2 時工具提示隨餐配合磷結合劑，實際用藥由醫師決定。'
            ],
            pitfall: '看到工具有推薦就照開。工具的產品清單不會因為血鉀 6.3 而消失，也不判斷個案需不需要 ONS。',
            src: ['kdoqi']
        },
        {
            id: 'ndd-refeeding',
            title: '瘦弱長者電解質已低：補太快比不補更危險',
            tag: '未透析・再餵食',
            stem: '84 歲女性，CKD 第 5 期未透析，衰弱，肺炎住院中。近一週幾乎沒進食，血磷 2.1、血鉀 3.4、白蛋白 2.8。家屬希望盡快補足營養。',
            facts: ['150 cm／38 kg', 'BMI 16.9', 'Alb 2.8', 'K 3.4', 'P 2.1', 'Na 130', 'Ca 7.9'],
            question: '工具算出 1440–1680 kcal、蛋白質 28.8–38.4 g。這兩個數字現在能直接用嗎？',
            base: { age: 84, gender: 'female', height: 150, weight: 38, dialysis: 'ndd', 'pd-protein-status': 'stable', appetite: 'decreased', dm: 'no', hba1c: '', alb: 2.8, na: 130, k: 3.4, ca: 7.9, p: 2.1 },
            scenarios: [
                { label: '目前狀況', patch: {}, expect: { energy: [1440, 1680], protein: [28.8, 38.4], top: 'fresubin_renal', red: 3, amber: 4, urgent: false } },
                { label: '電解質補正後 K 4.0、P 3.2', patch: { k: 4.0, p: 3.2 }, expect: { energy: [1440, 1680], protein: [28.8, 38.4], top: 'fresubin_renal', red: 3, amber: 2, urgent: false } }
            ],
            read: [
                '<b>兩個數字都不能直接用。</b>蛋白質：KDOQI 3.0.1 的限制對象是「代謝穩定」者。KDIGO PP 3.3.1.3 明言代謝不穩定者不要開低蛋白飲食，PP 3.3.1.5 則指出衰弱或肌少症長者可考慮提高蛋白質與熱量目標。工具不分這些情況，仍顯示 0.6–0.8 g/kg。',
                '<b>熱量：</b>她進食極少，電解質已偏低，須評估再餵食風險。ASPEN 2020 對有風險的成人建議首 24 小時 100–150 g 葡萄糖或 10–20 kcal/kg，再每 1–2 天增加目標量的 33%。以實際體重 38 kg 計是 380–760 kcal。',
                '<b>一瓶倍速力就有 400 kcal</b>，再加上餐食，很快就超過起始範圍。工具「每日 1–2 罐」的通用提示不適用於這個階段。'
            ],
            plan: [
                'ASPEN：中高風險且電解質低者，可考慮先補充或矯正電解質，再開始或增加熱量。',
                'ASPEN：有風險者在進食或給含葡萄糖輸液前補充 thiamin 100 mg。',
                '依 ASPEN 建議的監測頻率追蹤磷、鉀、鎂，並留意血鈉 130 與液體攝取。'
            ],
            pitfall: '急著達成目標熱量。工具的低血磷提示只有一句，起始速度和監測要由團隊另外訂。',
            src: ['kdoqi', 'kdigo', 'aspen']
        }
    ];

    // 選項順序固定，答案 A–D 各 5 題。
    const QUIZ = [
        { level: '基礎', stem: '依本工具公式，男性 165 cm 的理想體重（IBW）是多少？', options: ['59.5 kg', '57.0 kg', '60.0 kg', '64.0 kg'], answer: 0, why: '工具公式：男性 (身高 − 80) × 0.7 = 85 × 0.7 = 59.5。57.0 是誤用女性公式 (身高 − 70) × 0.6。', src: [] },
        { level: '基礎', stem: '女性 158 cm、血液透析。工具顯示的每日蛋白質目標是多少？', options: ['31.7–42.2 g', '52.8–63.4 g', '63.4–73.9 g', '68.6–79.2 g'], answer: 2, why: 'IBW = 88 × 0.6 = 52.8 kg，工具 HD 用 1.2–1.4 g/kg，得 63.4–73.9 g。52.8–63.4 g 是 KDOQI 1.0–1.2 g/kg 的換算值。', src: [] },
        { level: '基礎', stem: 'KDOQI 2020 對代謝穩定的維持性血液透析與腹膜透析者，建議的蛋白質攝取量是？', options: ['0.8–1.0 g/kg/天', '1.0–1.2 g/kg/天', '1.2–1.4 g/kg/天', '1.3–1.5 g/kg/天'], answer: 1, why: 'KDOQI 3.0.3 是 1.0–1.2 g/kg/天（MHD 1C、PD OPINION）。工具的 HD 預設 1.2–1.4 g/kg 高於此範圍。', src: ['kdoqi'] },
        { level: '基礎', stem: 'KDOQI 2020 對 CKD 3–5、無糖尿病且代謝穩定的成人，低蛋白飲食的建議量是？', options: ['0.8 g/kg/天', '0.6–0.8 g/kg/天', '1.0–1.2 g/kg/天', '0.55–0.60 g/kg/天'], answer: 3, why: 'KDOQI 3.0.1 是 0.55–0.60 g/kg/天。0.6–0.8 是合併糖尿病者（3.0.2）；0.8 是 KDIGO 2024 的建議。', src: ['kdoqi', 'kdigo'] },
        { level: '基礎', stem: 'KDOQI 2020 對代謝穩定的 CKD 1–5D 成人，建議的熱量範圍是？', options: ['20–25 kcal/kg/天', '30–35 kcal/kg/天', '25–35 kcal/kg/天', '35–40 kcal/kg/天'], answer: 2, why: 'KDOQI 3.1.1 是 25–35 kcal/kg/天，並依年齡、活動量等調整。工具固定用 30–35，下限較高。', src: ['kdoqi'] },
        { level: '基礎', stem: '勾選「食慾下降／體重減輕」後，工具會優先排列哪一種劑型？', options: ['液狀濃縮配方', '粉狀沖泡配方', '管灌配方', '不改變排序'], answer: 0, why: '食慾下降時，工具把液狀濃縮排在前面；食慾正常時，把粉劑排在前面。', src: [] },
        { level: '基礎', stem: 'ISRNM 的透析病人 PEW 臨床診斷，需要符合什麼條件？', options: ['白蛋白 &lt;3.8 g/dL 即可', 'BMI &lt;23 加上白蛋白偏低', '四類全部符合', '四類中至少三類，每類至少一項'], answer: 3, why: '四類為血清指標、身體質量、肌肉量、飲食攝取；至少三類，每類至少一項。', src: ['isrnm'] },
        { level: '基礎', stem: '腹膜透析病人血鉀 3.1。依工具提示，選配方時應該怎麼做？', options: ['優先選每份鉀最低的產品', '不需刻意選極低鉀配方，評估飲食鉀並由醫師決定是否補充', '停用所有 ONS', '改用未透析配方'], answer: 1, why: '低血鉀時，工具提示不需刻意選極低鉀配方。PD 使用透析產品線，不會改列未透析配方。', src: [] },
        { level: '基礎', stem: '血鉀達多少時，工具會提示「立即通知醫師評估」？', options: ['≥ 6.0 mEq/L', '&gt; 5.0 mEq/L', '≥ 5.5 mEq/L', '≥ 6.5 mEq/L'], answer: 0, why: '工具規則：K &gt;5.0 跳高血鉀警戒，K ≥6.0 另加立即通知。這是工具門檻，並非 KDOQI 條文。', src: [] },
        { level: '基礎', stem: 'KDOQI 2020 對 CKD 3–5D 的鈉攝取建議是？', options: ['&lt;1.5 g/天', '&lt;2.0 g/天', '&lt;3.0 g/天', '&lt;2.3 g/天（&lt;100 mmol/天）'], answer: 3, why: 'KDOQI 6.5.1：限制鈉攝取 &lt;100 mmol/天（&lt;2.3 g/天），以降低血壓並改善容量控制。', src: ['kdoqi'] },

        { level: '高階', stem: '未透析、糖尿病、食慾下降的個案，工具把倍速力排第一，警訊卻建議勝補納與慎選 1。最正確的解讀是？', options: ['程式有錯，應以排序為準', '排序不考慮血糖，要把排序與警訊合併判斷', '警訊只適用於透析病人', '有糖尿病就不能使用 ONS'], answer: 1, why: '排序只看劑型與高鉀、高磷。糖尿病只改變警訊內容，所以兩者可能指向不同產品。', src: [] },
        { level: '高階', stem: '未透析 DM 男性，IBW 61.6 kg，工具蛋白上限 49.3 g，正餐已吃 42 g。只看蛋白質上限，下列哪一種可加 1 份而不超過？（本頁內建值）', options: ['勝補納（10.6 g）', '思耐得慎選 1（10.6 g）', '倍速力（6 g）', '以上皆會超過'], answer: 2, why: '42 + 6 = 48 g，未超過 49.3 g；42 + 10.6 = 52.6 g 則超過。但倍速力不是工具標記的低 GI 產品，血糖仍要另外評估。', src: [] },
        { level: '高階', stem: '血鈣 7.6、白蛋白 3.0。工具的判讀是？', options: ['校正鈣 7.6，跳低血鈣', '校正鈣 8.0，跳低血鈣', '校正鈣 8.8，不跳警訊', '校正鈣 8.4，不跳低血鈣'], answer: 3, why: '7.6 + 0.8 × (4 − 3.0) = 8.4。工具門檻是 &lt;8.4，剛好等於門檻，所以不跳。公式只是估算，請配合臨床判讀。', src: [] },
        { level: '高階', stem: 'HD 病人 Alb 3.2、BMI 21，體重穩定，飲食紀錄達標，肌肉量未測。依 ISRNM 應如何判斷？', options: ['目前只有兩類，尚未符合，應評估肌肉量並排除發炎等原因', '已可診斷 PEW', '白蛋白低就應診斷', 'BMI 高於 18.5 就可排除 PEW'], answer: 0, why: '血清與身體質量只有兩類，飲食不符，肌肉量未知。KDOQI 1.2.1 也提醒，白蛋白不可單獨判讀。', src: ['isrnm', 'kdoqi'] },
        { level: '高階', stem: 'HD 病人 K 5.6、食慾下降。工具首位是勝力 2，並標「鉀 ≥200」；警訊卻只列元氣強。最恰當的處理是？', options: ['工具矛盾，兩者都不能用', '依缺口評估份量與組合：元氣強低鉀但每包只有 104 kcal，液劑熱量高但鉀較多', '只喝元氣強就能補足熱量', '高鉀時液劑一律禁用'], answer: 1, why: '排序先看劑型，再比鉀，因此液劑在前；低鉀清單是另一條規則。要依熱量、蛋白質缺口與鉀負荷一起決定。', src: [] },
        { level: '高階', stem: '以本頁內建值計算，勝力 2 1 罐＋元氣強 1 包的總量是？', options: ['425 kcal、19.1 g、鉀 230 mg', '529 kcal、27.5 g、鉀 310.8 mg', '529 kcal、27.5 g、鉀 270.8 mg', '604 kcal、27.5 g、鉀 270.8 mg'], answer: 2, why: '425 + 104 = 529 kcal；19.1 + 8.4 = 27.5 g；230 + 40.8 = 270.8 mg。310.8 mg 是普寧勝的組合（本頁內建鉀值）。', src: [] },
        { level: '高階', stem: 'PD 病人 IBW 63 kg。假設團隊估計透析液每日提供 400 kcal，扣除後的經口熱量目標約為？', options: ['1890–2205 kcal', '1575–2205 kcal', '2290–2605 kcal', '1490–1805 kcal'], answer: 3, why: '工具 30–35 kcal/kg 得 1890–2205 kcal，扣 400 得 1490–1805 kcal。工具只提醒要扣除，不會自動計算，400 kcal 是題目假設。', src: [] },
        { level: '高階', stem: 'HD、糖尿病、使用 ESA。HbA1c 6.4%，但居家血糖常超過 200 mg/dL。工具與判讀應是？', options: ['工具仍因糖尿病跳血糖提醒；HbA1c 可能低估，應合併血糖紀錄', 'HbA1c &lt;7% 所以工具不提醒，血糖已達標', '應以 HbA1c 為準，忽略居家血糖', '應改用未透析低 GI 配方'], answer: 0, why: '只要勾選糖尿病或 HbA1c ≥7%，工具就會提醒。透析者另有提示：HbA1c 受貧血、ESA 影響可能低估。這句是工具內建提示，本次未重讀 KDIGO 糖尿病指引原文。', src: [] },
        { level: '高階', stem: '84 歲未透析、衰弱，肺炎住院，血磷 2.1。工具仍顯示 0.6–0.8 g/kg。依 KDIGO 2024 應如何看待？', options: ['仍應嚴格執行，以保護腎功能', '應改為極低蛋白飲食加酮酸', '代謝不穩定不應開低蛋白飲食，衰弱長者可考慮提高目標，並先評估再餵食風險', '蛋白質應立刻提高到 1.5 g/kg 以上'], answer: 2, why: 'KDIGO PP 3.3.1.3 與 3.3.1.5。工具沒有「代謝不穩定」或「衰弱」的輸入，要靠臨床判斷。再餵食的起始速度見 ASPEN 2020。', src: ['kdigo', 'aspen'] },
        { level: '高階', stem: 'HD 病人有 PEW，飲食諮詢加 ONS 持續 3 個月後，仍無法達到需求。依 KDOQI 2020 的下一步是？', options: ['繼續 ONS，不必調整', '可考慮管灌試驗；口服與腸道仍不足時，可試 IDPN', '常規改用胺基酸透析液', '常規補充硒與鋅'], answer: 1, why: 'KDOQI 4.1.2（OPINION）與 4.1.3（2C）。胺基酸透析液是 PD 的議題（4.2.1）；5.6.1 建議不要常規補充硒或鋅。', src: ['kdoqi'] }
    ];

    const MAP = {
        center: ['CKD 5／5D ONS', '選擇與追蹤'],
        branches: [
            { title: '1 先分族群', color: '#B45309', leaves: ['未透析 → 低蛋白產品線', 'HD／PD → 透析產品線', 'PD 分穩定／蛋白流失／高分解', '工具沒有「代謝不穩定」與「衰弱」欄位'] },
            { title: '2 估算需求', color: '#047857', leaves: ['IBW：男 (身高−80)×0.7、女 (身高−70)×0.6', '工具熱量 30–35；KDOQI 25–35 kcal/kg', '未透析：工具 0.6–0.8；KDOQI 無 DM 0.55–0.60、有 DM 0.6–0.8；KDIGO 0.8 g/kg', 'HD：工具 1.2–1.4；KDOQI 穩定者 1.0–1.2 g/kg', 'PD：葡萄糖吸收要自己扣'] },
            { title: '3 評估 PEW', color: '#B91C1C', leaves: ['血清：Alb &lt;3.8', '身體質量：BMI &lt;23 或非刻意體重下降', '肌肉量：下降或 MAMC 偏低', '飲食：蛋白 &lt;0.8、熱量 &lt;25，持續 ≥2 個月', '四類至少三類；白蛋白不可單獨判讀'] },
            { title: '4 先看急性警訊', color: '#7C2D12', leaves: ['K ≥6.0 → 立即通知（工具門檻）', '進食極少＋電解質低 → 再餵食評估', 'ASPEN 有風險者：首日 10–20 kcal/kg，每 1–2 天增加目標量 33%', '補 thiamin 100 mg，追蹤磷、鉀、鎂'] },
            { title: '5 選產品與份量', color: '#1D4ED8', leaves: ['食慾下降 → 液狀；食慾正常 → 粉狀', 'K &gt;5.0、P &gt;5.5 → 同劑型內依鉀、磷排序', '糖尿病不影響排序，只看警訊', '算蛋白質空間與熱量缺口', '液體與鈉都要計入（鈉 &lt;2.3 g/天）'] },
            { title: '6 追蹤與升階', color: '#6D28D9', leaves: ['ONS 至少試 3 個月（KDOQI 2D）', '追蹤體重、飲食、K、P、Na、血糖', '不足 → 管灌試驗（OPINION）', 'PEW → TPN／IDPN（2C）', '使用前核對產品最新標示'] }
        ]
    };

    return { SOURCES, CASES, QUIZ, MAP, runCase };
});
