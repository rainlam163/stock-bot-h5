// ==================== 粒子背景 ====================
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 50;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.02;

      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      const opacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 83, ${opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  init();
  animate();
})();

// ==================== 玄学数据 ====================

// 八卦
const BAGUA = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
const BAGUA_NATURE = ['天', '泽', '火', '雷', '风', '水', '山', '地'];

// 五行
const WUXING = ['金', '木', '水', '火', '土'];
const WUXING_COLOR = {
  '金': '#d4a853',
  '木': '#4a8c5c',
  '水': '#4a6c8c',
  '火': '#c04040',
  '土': '#a08040',
};

// 方位
const FANGWEI = ['东', '南', '西', '北', '东南', '东北', '西南', '西北'];

// 六十四卦名（简化取用）
const GUA_NAMES = [
  '乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼',
  '地水师', '水地比', '风天小畜', '天泽履', '地天泰', '天地否',
  '天火同人', '火天大有', '地山谦', '雷地豫', '泽雷随', '山风蛊',
  '地泽临', '风地观', '火雷噬嗑', '山火贲', '山地剥', '地雷复',
  '天雷无妄', '山天大畜', '山雷颐', '泽风大过', '坎为水', '离为火',
  '泽山咸', '雷风恒', '天山遁', '雷天大壮', '火地晋', '地火明夷',
  '风火家人', '火泽睽', '水山蹇', '雷水解', '山泽损', '风雷益',
  '泽天夬', '天风姤', '泽地萃', '地风升', '泽水困', '水风井',
  '泽火革', '火风鼎', '震为雷', '艮为山', '风山渐', '雷泽归妹',
  '雷火丰', '火山旅', '巽为风', '兑为泽', '风水涣', '水泽节',
  '风泽中孚', '雷山小过', '水火既济', '火水未济',
];

// 九级凶吉
const FORTUNE_LEVELS = [
  {
    name: '大吉',
    class: 'daji',
    desc: '天时地利人和，万事俱备，今日运势如虹，宜果断出手。',
    advices: [
      '贵人相助，宜大胆布局',
      '五行皆旺，持股待涨',
      '卦象极阳，顺势而为',
    ],
  },
  {
    name: '上吉',
    class: 'shangji',
    desc: '紫气东来，运势上佳，虽有小碍，无伤大局。',
    advices: [
      '吉星高照，可适度加仓',
      '阳气渐盛，宜守中带攻',
      '风雷助力，顺势操作',
    ],
  },
  {
    name: '中吉',
    class: 'zhongji',
    desc: '运势平稳向好，有吉兆显现，但需留意盘中波动。',
    advices: [
      '卦象偏吉，可持有观望',
      '阴阳调和，不宜急进',
      '小有贵人，逢低可入',
    ],
  },
  {
    name: '小吉',
    class: 'xiaoji',
    desc: '运势微吉，有获利之象，然需谨防贪心。',
    advices: [
      '吉中带险，见好就收',
      '小有利可图，短线为宜',
      '不可追高，耐心等待',
    ],
  },
  {
    name: '末吉',
    class: 'moji',
    desc: '先凶后吉之象，开盘或有波动，尾盘方见转机。',
    advices: [
      '先苦后甜，切勿恐慌',
      '午后转势，注意时机',
      '事缓则圆，不宜急躁',
    ],
  },
  {
    name: '平',
    class: 'ping',
    desc: '阴阳平衡，吉凶未判，宜观望不动，等待明确信号。',
    advices: [
      '卦象中和，观望为主',
      '不进不退，按兵不动',
      '静待天时，暂不宜操作',
    ],
  },
  {
    name: '小凶',
    class: 'xiaoxiong',
    desc: '运势偏弱，恐有小幅回调，需提高警惕。',
    advices: [
      '阴气渐重，宜减仓观望',
      '小有波折，注意止损',
      '不宜加仓，防守为上',
    ],
  },
  {
    name: '中凶',
    class: 'zhongxiong',
    desc: '卦象不吉，恐有下行压力，谨慎操作为妙。',
    advices: [
      '凶兆明显，建议减仓',
      '水火相冲，切忌追高',
      '宜守不宜攻，保本为先',
    ],
  },
  {
    name: '大凶',
    class: 'daxiong',
    desc: '天时不利，诸事不宜，退守为上策，切忌冲动。',
    advices: [
      '大凶之象，清仓为宜',
      '五鬼运财，恐有大跌',
      '退一步海阔天空，今日不宜操作',
    ],
  },
];

// ==================== 玄学算法 ====================

/**
 * 基于股票名称生成确定性哈希值
 * 同一股票名称 + 同一日期 = 同一结果
 * dayOffset: 0=今日, 1=明日
 */
function hashStockName(name, salt, dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + (dayOffset || 0));
  const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const combined = `${name}${dateStr}${salt}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 计算笔画数（简化：使用字符编码模拟）
 */
function strokeCount(char) {
  const code = char.charCodeAt(0);
  return (code % 20) + 1;
}

/**
 * 起卦主算法
 * dayOffset: 0=今日, 1=明日
 */
function divine(name, dayOffset) {
  // 基于总笔画数取本卦
  const totalStrokes = [...name].reduce((sum, c) => sum + strokeCount(c), 0);
  const benGuaIndex = totalStrokes % 64;

  // 变卦：笔画 + 日期哈希
  const bianHash = hashStockName(name, 'bian', dayOffset);
  const bianGuaIndex = (benGuaIndex + (bianHash % 16)) % 64;

  // 五行：基于名称首字
  const wxHash = hashStockName(name, 'wuxing', dayOffset);
  const wuxing = WUXING[wxHash % WUXING.length];

  // 方位
  const fwHash = hashStockName(name, 'fangwei', dayOffset);
  const fangwei = FANGWEI[fwHash % FANGWEI.length];

  // 凶吉级别计算（综合多因素）
  const fortuneHash = hashStockName(name, 'fortune', dayOffset);
  const guaQi = fortuneHash % 100; // 卦气值 0-99

  // 八卦方位影响
  const baguaIndex = (totalStrokes + (fortuneHash % 8)) % 8;
  const baguaBonus = [10, 6, 4, 2, 0, -2, -6, -10][baguaIndex]; // 乾最吉，坤最凶

  // 五行生克影响
  const wuxingBonus = { '金': 5, '木': 3, '水': 1, '火': -1, '土': -3 }[wuxing];

  // 综合卦分
  const rawScore = guaQi + baguaBonus + wuxingBonus;
  const score = Math.max(0, Math.min(100, rawScore));

  // 映射到九级凶吉
  let fortuneIndex;
  if (score >= 90) fortuneIndex = 0;       // 大吉
  else if (score >= 80) fortuneIndex = 1;   // 上吉
  else if (score >= 68) fortuneIndex = 2;   // 中吉
  else if (score >= 56) fortuneIndex = 3;   // 小吉
  else if (score >= 46) fortuneIndex = 4;   // 末吉
  else if (score >= 40) fortuneIndex = 5;   // 平
  else if (score >= 30) fortuneIndex = 6;   // 小凶
  else if (score >= 18) fortuneIndex = 7;   // 中凶
  else fortuneIndex = 8;                     // 大凶

  const fortune = FORTUNE_LEVELS[fortuneIndex];

  // 选择建议（基于哈希取其中一条）
  const adviceIndex = hashStockName(name, 'advice', dayOffset) % fortune.advices.length;

  // 日期标签
  const dateLabel = dayOffset === 1 ? '明日' : '今日';

  return {
    stockName: name,
    dateLabel,
    fortune,
    benGua: GUA_NAMES[benGuaIndex],
    bianGua: GUA_NAMES[bianGuaIndex],
    wuxing,
    fangwei,
    advice: fortune.advices[adviceIndex],
  };
}

// ==================== UI 交互 ====================

let isDivining = false;
let currentDayOffset = 0; // 0=今日, 1=明日

function switchDate(btn) {
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentDayOffset = parseInt(btn.dataset.offset, 10);
}

function startDivination() {
  const input = document.getElementById('stockInput');
  const name = input.value.trim();

  if (!name) {
    input.style.borderColor = 'rgba(192, 64, 64, 0.5)';
    input.placeholder = '请先输入股票名称';
    setTimeout(() => {
      input.style.borderColor = '';
      input.placeholder = '输入股票名称，如：贵州茅台';
    }, 2000);
    return;
  }

  if (isDivining) return;
  isDivining = true;

  // 隐藏结果，显示动画
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('animationSection').classList.remove('hidden');

  // 禁用按钮
  const btn = document.getElementById('divineBtn');
  btn.style.opacity = '0.5';
  btn.style.pointerEvents = 'none';

  // 占卜动画持续2.5秒后显示结果
  setTimeout(() => {
    const result = divine(name, currentDayOffset);
    showResult(result);
    isDivining = false;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }, 2500);
}

function showResult(result) {
  // 隐藏动画
  document.getElementById('animationSection').classList.add('hidden');

  // 填充数据
  document.getElementById('resultStockName').textContent = `「${result.stockName}」${result.dateLabel}运势`;
  document.getElementById('fortuneLevel').textContent = result.fortune.name;
  document.getElementById('fortuneLevel').className = `fortune-level ${result.fortune.class}`;
  document.getElementById('fortuneDesc').textContent = result.fortune.desc;
  document.getElementById('benGua').textContent = result.benGua;
  document.getElementById('bianGua').textContent = result.bianGua;
  document.getElementById('wuXing').textContent = result.wuxing;
  document.getElementById('fangWei').textContent = result.fangwei;
  document.getElementById('adviceBox').textContent = `卦辞曰：${result.advice}`;

  // 显示结果
  const resultSection = document.getElementById('resultSection');
  resultSection.classList.remove('hidden');

  // 触发动画
  const card = resultSection.querySelector('.result-card');
  card.classList.remove('animate-in');
  void card.offsetWidth; // force reflow
  card.classList.add('animate-in');
}

function resetDivination() {
  document.getElementById('resultSection').classList.add('hidden');
  document.getElementById('stockInput').value = '';
  document.getElementById('stockInput').focus();
}

// 回车触发占卜
document.getElementById('stockInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    startDivination();
  }
});
