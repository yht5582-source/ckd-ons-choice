/*ENGINE-START*/
(function (root) {
    const PRODUCTS = [
        // 未透析專用產品 (NDD)
        {
            id: 'fresubin_renal',
            name: '費森尤斯卡比 倍速力 Fresubin Renal（未洗腎）',
            shortName: '倍速力(未洗腎)',
            brand: '費森尤斯卡比',
            type: 'ndd',
            form: 'liquid',
            kcal: 400,
            volume: '200 mL',
            density: '2.0 Kcal/mL',
            protein: 6.0,
            proteinRatio: '6%',
            na: 136,
            k: 200,
            p: 110,
            lowGI: false,
            src: 'https://www.fresenius-kabi-en-mall.com.tw/SalePage/Index/8808667',
            clinicalFocus: '【液狀濃縮】極低蛋白質 (6g/瓶) + 2.0 Kcal/mL 超高熱量',
            features: '極低蛋白質、高單元不飽和脂肪(MUFA)、深海魚油(EPA/DHA)，適合未洗腎、食慾不佳或體重減輕需補充熱量之個案。',
            tags: ['液狀濃縮配方', '極低蛋白質6g', '濃縮高熱量2.0', '深海魚油EPA/DHA']
        },
        {
            id: 'suplena',
            name: '亞培 勝補納 (Suplena)',
            shortName: '勝補納',
            brand: '亞培 (Abbott)',
            type: 'ndd',
            form: 'liquid',
            kcal: 425,
            volume: '237 mL',
            density: '1.8 Kcal/mL',
            protein: 10.6,
            proteinRatio: '10%',
            na: 190,
            k: 270,
            p: 170,
            lowGI: true,
            src: 'https://www.family.abbott/tw-zh/adult/nepro/product/suplena-non-dialysis-formula.html',
            clinicalFocus: '【液狀濃縮】低蛋白質 (10.6g) + CarbSteady 低GI緩釋醣',
            features: 'CarbSteady 慢消化醣類低GI配方、含水溶性膳食纖維及單元不飽和脂肪酸，提供未透析食慾不佳且高血糖管理之選擇。',
            tags: ['液狀濃縮配方', '低蛋白質10.6g', 'CarbSteady低GI', '含膳食纖維']
        },
        {
            id: 'shenxuan1',
            name: '思耐得 補體素慎選1 (未洗腎適用)',
            shortName: '思耐得慎選1',
            brand: '思耐得 (Sinaide)',
            type: 'ndd',
            form: 'liquid',
            kcal: 446,
            volume: '237 mL',
            density: '1.9 Kcal/mL',
            protein: 10.8,
            proteinRatio: '10%',
            na: 236,
            k: 300,
            p: 188,
            lowGI: true,
            src: 'https://www.smad.com.tw/products/ckd',
            clinicalFocus: '【液狀濃縮】低蛋白質 (10.8g) + 低糖配方',
            features: '高單元不飽和脂肪(MUFA)、Omega-3、添加維生素D3與膳食纖維。鉀與磷在同類液劑中較高，高血鉀或高血磷時請留意。',
            tags: ['液狀濃縮配方', '低蛋白質10.8g', '高MUFA好油脂', '低糖']
        },
        {
            id: 'yinengchong',
            name: '益富 易能充 (粉劑沖泡)',
            shortName: '易能充',
            brand: '益富 (Yifu)',
            type: 'ndd',
            form: 'powder',
            kcal: 200,
            volume: '45 g/包',
            density: '高熱量點心補充',
            protein: 0.8,
            proteinRatio: '<2%',
            na: 113,
            k: 108,
            p: 42,
            lowGI: false,
            src: 'https://www.enutrition.com.tw/products/kidney-powder-ckd',
            clinicalFocus: '【粉狀沖泡】超低蛋白質 (0.8g/包) + 純熱量彈性點心',
            features: '食慾正常時首選！蛋白質含量極低(<1g)，提供純粹熱量與適量優質脂肪，電解質極低，適合正餐之外彈性沖泡補充熱量。',
            tags: ['粉狀沖泡配方', '超低蛋白質<1g', '食慾正常點心首選', '極低電解質']
        },

        // 已透析專用產品 (DD)
        {
            id: 'shengli2',
            name: '思耐得 補體素勝力2 (洗腎透析適用)',
            shortName: '思耐得勝力2',
            brand: '思耐得 (Sinaide)',
            type: 'dd',
            form: 'liquid',
            kcal: 450,
            volume: '237 mL',
            density: '1.9 Kcal/mL',
            protein: 20.2,
            proteinRatio: '18%',
            na: 190,
            k: 190,
            p: 172,
            lowGI: true,
            src: 'https://www.smad.com.tw/products/hd',
            clinicalFocus: '【液狀濃縮】高蛋白質 (20.2g) + 藻油 Omega-3 + 低GI',
            features: '低糖、低GI、含藻油 Omega-3、MCT、維生素D3與單元不飽和脂肪，適合食慾不佳、透析消瘦個案。',
            tags: ['液狀濃縮配方', '高蛋白20.2g', '藻油Omega-3', '低GI', '鉀190mg']
        },
        {
            id: 'nepro',
            name: '亞培 普寧勝 (Nepro)',
            shortName: '普寧勝',
            brand: '亞培 (Abbott)',
            type: 'dd',
            form: 'liquid',
            kcal: 425,
            volume: '237 mL',
            density: '1.8 Kcal/mL',
            protein: 19.1,
            proteinRatio: '18%',
            na: 250,
            k: 250,
            p: 170,
            lowGI: true,
            src: 'https://www.family.abbott/tw-zh/adult/nepro/product/nepro-dialysis-formula.html',
            clinicalFocus: '【液狀濃縮】高蛋白質 (19.1g) + CarbSteady 低GI + 肉鹼牛磺酸',
            features: '高蛋白濃縮熱量、CarbSteady 低GI慢消化醣類、強化 L-肉鹼 (L-Carnitine) 與牛磺酸，補充透析流失。',
            tags: ['液狀濃縮配方', '高蛋白19.1g', 'CarbSteady低GI', '含肉鹼牛磺酸']
        },
        {
            id: 'fresubin_protein',
            name: '費森尤斯卡比 倍速力 Fresubin Protein Energy（洗腎）',
            shortName: '倍速力(洗腎)',
            brand: '費森尤斯卡比',
            type: 'dd',
            form: 'liquid',
            kcal: 300,
            volume: '200 mL',
            density: '1.5 Kcal/mL',
            protein: 20.0,
            proteinRatio: '27%',
            na: 116,
            k: 292,
            p: 240,
            lowGI: false,
            src: 'https://www.fresenius-kabi-en-mall.com.tw/SalePage/Index/9124815',
            clinicalFocus: '【液狀濃縮】最高蛋白質密度 (20g/200mL, 27%)',
            features: '小體積提供 20g 蛋白質，蛋白熱量比 27%。鉀 292 mg、磷 240 mg 在透析液劑中最高，高血鉀或高血磷時請留意。數值為熱帶水果口味標示，香草口味請另核對。',
            tags: ['液狀濃縮配方', '蛋白20g', '高蛋白比27%', '小體積']
        },
        {
            id: 'yuanqiqiang',
            name: '益富 元氣強 (高蛋白極低鉀沖泡)',
            shortName: '元氣強',
            brand: '益富 (Yifu)',
            type: 'dd',
            form: 'powder',
            kcal: 104,
            volume: '24 g/包',
            density: '高蛋白濃縮點心',
            protein: 8.4,
            proteinRatio: '32%',
            na: 107,
            k: 40.8,
            p: 86,
            lowGI: false,
            src: 'https://www.enutrition.com.tw/products/kidney-powder-dialysis',
            clinicalFocus: '【粉狀沖泡】高蛋白質密度 (32%) + 極低鉀離子 (40.8mg/包)',
            features: '食慾正常時首選！蛋白質比例高達 32%，鉀離子極低（僅 40.8 mg），適合透析間期食慾正常個案作為點心濃縮補充蛋白質。',
            tags: ['粉狀沖泡配方', '蛋白密度32%', '食慾正常點心首選', '極低鉀40.8mg']
        }
    ];

    // 警訊門檻（每份）
    const LOW_K_PER_SERVING = 200;   // mg
    const LOW_P_PER_SERVING = 170;   // mg（< 170）

    // KDOQI 2020：未透析無糖尿病 0.55–0.60（3.0.1）、有糖尿病 0.6–0.8（3.0.2）；HD 代謝穩定 1.0–1.2（3.0.3）
    function getProteinTarget(dialysis, pdProteinStatus, dm) {
        if (dialysis === 'ndd') {
            return dm === 'yes'
                ? { min: 0.6, max: 0.8, label: '0.6~0.8g' }
                : { min: 0.55, max: 0.6, label: '0.55~0.60g' };
        }

        if (dialysis === 'hd') {
            return { min: 1.0, max: 1.2, label: '1.0~1.2g' };
        }

        if (pdProteinStatus === 'catabolic') {
            return { min: 1.3, max: 1.5, label: '1.3~1.5g' };
        }

        if (pdProteinStatus === 'protein_loss') {
            return { min: 1.2, max: 1.3, label: '1.2~1.3g' };
        }

        return { min: 1.0, max: 1.2, label: '1.0~1.2g' };
    }

    // 空白或非數字 → null（不再以預設值偷偷代入）
    function num(v) {
        if (v === null || v === undefined || String(v).trim() === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }

    const round1 = x => Math.round(x * 10) / 10;

    // 身高 cm、體重 kg；IBW 採國內常用公式 男 (H-80)×0.7、女 (H-70)×0.6
    function computeBody(gender, height, weight) {
        if (height === null || height < 120 || height > 220) return { valid: false, reason: '身高需介於 120–220 cm' };
        if (weight === null || weight < 25 || weight > 250) return { valid: false, reason: '體重需介於 25–250 kg' };
        const m = height / 100;
        const bmi = round1(weight / (m * m));
        const ibw = round1(gender === 'female' ? (height - 70) * 0.6 : (height - 80) * 0.7);
        const pctIbw = Math.round(weight / ibw * 100);
        return { valid: true, bmi, ibw, pctIbw };
    }

    function computeNeeds(ibw, proteinTarget) {
        return {
            energyMin: Math.round(ibw * 25),
            energyMax: Math.round(ibw * 35),
            proteinMin: round1(ibw * proteinTarget.min),
            proteinMax: round1(ibw * proteinTarget.max)
        };
    }

    function productsFor(dialysis) {
        const type = dialysis === 'ndd' ? 'ndd' : 'dd';
        return PRODUCTS.filter(p => p.type === type);
    }

    // 穩定排序：偏好劑型在前；高血鉀/高血磷時同劑型內再依鉀、磷由低到高
    function rankProducts(dialysis, appetite, k, p) {
        const preferred = appetite === 'decreased' ? 'liquid' : 'powder';
        const hyperK = k !== null && k > 5.0;
        const hyperP = p !== null && p > 5.5;
        return productsFor(dialysis)
            .map((item, i) => ({ item, i }))
            .sort((a, b) => {
                const fa = a.item.form === preferred ? 0 : 1;
                const fb = b.item.form === preferred ? 0 : 1;
                if (fa !== fb) return fa - fb;
                if (hyperK && a.item.k !== b.item.k) return a.item.k - b.item.k;
                if (hyperP && a.item.p !== b.item.p) return a.item.p - b.item.p;
                return a.i - b.i;
            })
            .map(x => ({ ...x.item, preferred: x.item.form === preferred }));
    }

    // 跨品牌組合：同族群所有液狀罐裝 + 該族群的粉劑 1 包，數值全部由 PRODUCTS 計算
    function computeCombo(dialysis) {
        const list = productsFor(dialysis);
        const bases = list.filter(p => p.form === 'liquid');
        const addon = list.find(p => p.form === 'powder');
        const range = key => {
            const vals = bases.map(b => round1(b[key] + addon[key]));
            return [Math.min(...vals), Math.max(...vals)];
        };
        return {
            bases,
            addon,
            kcal: range('kcal'),
            protein: range('protein'),
            na: range('na'),
            k: range('k'),
            p: range('p')
        };
    }

    // KDIGO 常用校正：Ca + 0.8 × (4 − Alb)，僅在 Alb < 4 時校正
    function correctedCa(ca, alb) {
        if (ca === null) return null;
        if (alb === null || alb >= 4) return ca;
        return round1(ca + 0.8 * (4 - alb));
    }

    const names = list => list.map(p => p.shortName).join('、');

    function buildAlerts(s) {
        const alerts = [];
        const list = productsFor(s.dialysis);
        const isNDD = s.dialysis === 'ndd';

        if (!s.body.valid) {
            alerts.push({ type: 'amber', text: `<b>基本資料不完整：</b>${s.body.reason}，熱量／蛋白質需求暫不計算。` });
        }

        if (s.appetite === 'decreased') {
            const liquids = list.filter(p => p.form === 'liquid');
            alerts.push({
                type: 'red',
                text: `<b>個案有【食慾下降或體重減輕】狀況：</b>優先推薦<b>高熱量密度「濃縮液狀配方」</b>（${liquids.map(p => `${p.shortName} ${p.density}`).join('、')}），能在體積受限與食慾不佳下迅速補足能量與蛋白質。`
            });
        } else {
            const powders = list.filter(p => p.form === 'powder');
            alerts.push({
                type: 'green',
                text: `<b>個案【食慾正常/體重穩定】：</b>可優先考量<b>「粉狀沖泡配方」</b>（${names(powders)}），方便於正餐之外彈性沖泡補充，不影響正餐進食量。`
            });
        }

        if (isNDD) {
            alerts.push({ type: 'amber', text: `<b>未透析 (NDD-CKD Stage 5) 衛教原則：</b>採低蛋白質飲食 (${s.proteinTarget.min}-${s.proteinTarget.max} g/kg/天，${s.dm === 'yes' ? '糖尿病' : '無糖尿病'}目標)，並確保熱量足夠以免分解肌肉。選用【未透析專用低蛋白低電解質配方】。<b>此目標僅適用代謝穩定者；急性疾病、感染或高分解等代謝不穩定時不應開低蛋白飲食，衰弱或肌少症長者可考慮提高目標。</b>` });
        } else if (s.dialysis === 'hd') {
            alerts.push({ type: 'green', text: `<b>血液透析 (HD-CKD Stage 5D) 衛教原則：</b>代謝穩定者蛋白質目標 ${s.proteinTarget.min}-${s.proteinTarget.max} g/kg/天；合併 PEW、感染或高分解時請個別調整。採用【透析專用高蛋白配方】，液狀配方需計入每日液體限制。` });
        } else {
            const pdStatusDescriptions = {
                stable: '代謝穩定、營養狀態良好',
                protein_loss: '考慮持續腹膜蛋白流失',
                catabolic: '合併 PEW、腹膜炎或高分解狀態'
            };
            alerts.push({
                type: s.pdProteinStatus === 'catabolic' ? 'red' : 'green',
                text: `<b>腹膜透析 (PD-CKD Stage 5D) 蛋白質目標：</b>${pdStatusDescriptions[s.pdProteinStatus] || pdStatusDescriptions.stable}，系統採 <b>${s.proteinTarget.min}-${s.proteinTarget.max} g/kg/天</b>。應依乾體重、蛋白流失、發炎狀態與營養評估個別調整；總熱量需扣除透析液葡萄糖吸收量。`
            });
        }

        if (s.body.valid) {
            if (s.body.bmi < 18.5) {
                alerts.push({ type: 'red', text: `<b>體重過輕 (BMI ${s.body.bmi})：</b>BMI < 18.5，PEW 風險高，應優先補足熱量並評估近期體重變化與飲食攝取。` });
            } else if (s.body.bmi < 23) {
                alerts.push({ type: 'amber', text: `<b>BMI ${s.body.bmi} < 23：</b>符合 ISRNM PEW 診斷之「身體質量」條件之一，請合併白蛋白、體重變化與肌肉量評估。` });
            }
            if (s.body.pctIbw > 120) {
                alerts.push({ type: 'amber', text: `<b>實際體重為 IBW 的 ${s.body.pctIbw}%：</b>需求以 IBW 估算；肥胖個案可改用調整體重並依臨床判斷修正。` });
            }
        }

        if (s.dm === 'yes' || (s.hba1c !== null && s.hba1c >= 7.0)) {
            const lowGI = list.filter(p => p.lowGI);
            const a1c = s.hba1c !== null ? `HbA1c: ${s.hba1c}%` : 'HbA1c 未填';
            const pick = lowGI.length ? `優先選用<b>具低GI／緩釋醣結構之${isNDD ? '未透析' : '透析'}專用配方</b>（${names(lowGI)}）` : '選用腎臟專用配方並監測血糖';
            const a1cNote = isNDD ? '' : '透析患者 HbA1c 受貧血、ESA 及紅血球壽命影響可能低估，宜合併血糖紀錄判讀；';
            alerts.push({ type: 'amber', text: `<b>合併糖尿病/血糖偏高 (${a1c}) 營養師提醒：</b>${pick}；${a1cNote}若選用一般糖尿病配方，須特別注意其蛋白質及電解質含量是否符合腎臟病需求。` });
        }

        if (s.alb !== null && s.alb < 3.8) {
            alerts.push({ type: 'red', text: `<b>血清白蛋白偏低 (Albumin: ${s.alb} g/dL)：</b>提示有 PEW 風險！需重視補足總熱量與優質蛋白質；白蛋白亦受發炎、感染與體液狀態影響。` });
        }

        if (s.na !== null) {
            if (s.na < 135) {
                alerts.push({ type: 'amber', text: `<b>低血鈉 (Na: ${s.na} mEq/L)：</b>評估水分攝取與液體限制；液狀配方的水分需計入每日液體量，高能量密度配方可減少液體負擔。` });
            } else if (s.na > 145) {
                alerts.push({ type: 'amber', text: `<b>高血鈉 (Na: ${s.na} mEq/L)：</b>評估水分攝取不足或流失，請醫師評估水分補充。` });
            }
        }

        if (s.k !== null) {
            if (s.k > 5.0) {
                const lowK = list.filter(p => p.k < LOW_K_PER_SERVING).sort((a, b) => a.k - b.k);
                const pick = lowK.length
                    ? `優先考量每份鉀 < ${LOW_K_PER_SERVING} mg 之低鉀產品（${lowK.map(p => `${p.shortName} ${p.k}mg`).join('、')}）`
                    : `本族群無每份鉀 < ${LOW_K_PER_SERVING} mg 之產品，請控制份數並計入每日鉀攝取`;
                const urgent = s.k >= 6.0 ? '<b>K ≥ 6.0 請立即通知醫師評估（心電圖、降鉀處置）。</b>' : '';
                alerts.push({ type: 'red', text: `<b>高血鉀警戒 (Serum K: ${s.k} mEq/L)：</b>${urgent}嚴格控鉀！${pick}。` });
            } else if (s.k < 3.5) {
                alerts.push({ type: 'amber', text: `<b>低血鉀 (Serum K: ${s.k} mEq/L)：</b>${s.dialysis === 'pd' ? '腹膜透析常見低血鉀，' : ''}不需刻意選擇極低鉀配方，請評估飲食鉀攝取並由醫師決定是否補充。` });
            }
        }

        if (s.p !== null) {
            if (s.p > 5.5) {
                const lowP = list.filter(p => p.p < LOW_P_PER_SERVING).sort((a, b) => a.p - b.p);
                alerts.push({ type: 'red', text: `<b>高血磷警戒 (Serum P: ${s.p} mg/dL)：</b>選用低磷配方（磷 < ${LOW_P_PER_SERVING} mg/份：${names(lowP)}），並請【隨餐配合磷結合劑】。` });
            } else if (s.p < 2.5) {
                alerts.push({ type: 'amber', text: `<b>低血磷 (Serum P: ${s.p} mg/dL)：</b>可能反映攝取不足；營養不良個案開始積極補充時須留意再餵食症候群。` });
            }
        }

        const cCa = correctedCa(s.ca, s.alb);
        if (cCa !== null) {
            const label = cCa !== s.ca ? `校正鈣 ${cCa} mg/dL（實測 ${s.ca}）` : `Ca ${s.ca} mg/dL`;
            if (cCa < 8.4) {
                alerts.push({ type: 'amber', text: `<b>低血鈣 (${label})：</b>請檢視活性維生素 D、含鈣磷結合劑與 PTH 狀態。` });
            } else if (cCa > 10.2) {
                alerts.push({ type: 'amber', text: `<b>高血鈣 (${label})：</b>請檢視含鈣磷結合劑、活性維生素 D 劑量及透析液鈣濃度。` });
            }
        }

        return alerts;
    }

    // 每份佔每日目標百分比（以目標下限計）
    function servingShare(product, needs) {
        if (!needs) return null;
        return {
            energy: Math.round(product.kcal / needs.energyMin * 100),
            protein: Math.round(product.protein / needs.proteinMin * 100)
        };
    }

    const api = {
        PRODUCTS, LOW_K_PER_SERVING, LOW_P_PER_SERVING,
        getProteinTarget, num, computeBody, computeNeeds, productsFor,
        rankProducts, computeCombo, correctedCa, buildAlerts, servingShare
    };

    root.CKDONS = api;
    root.getProteinTarget = getProteinTarget;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
/*ENGINE-END*/
