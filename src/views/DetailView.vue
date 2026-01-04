<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';

const router = useRouter();
const stock = ref(null);

const goBack = () => {
  router.back();
};

const goToDiagnosis = () => {
  if (stock.value) {
    router.push({
      path: '/',
      query: { code: stock.value.code }
    });
  }
};

const renderMarkdown = (text) => {
  return marked.parse(text || '');
};

onMounted(() => {
  // Get data from route state or query (simplified for now using query/state)
  // Ideally, store management (Pinia) would be better, but we'll use history state pass
  const state = history.state;
  if (state && state.stock) {
    stock.value = JSON.parse(state.stock);
  } else {
    // Fallback if no state (e.g. refresh), redirect to recommend list
    router.replace('/recommend');
  }
});
</script>

<template>
  <div class="detail-container" v-if="stock">
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="返回">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="header-title">
        <span class="stock-name">{{ stock.name }}</span>
        <span class="stock-code">({{ stock.code }})</span>
      </div>
    </header>

    <main class="content-body">
      <!-- Score Card -->
      <div class="score-card">
        <div class="score-circle">
          <span class="score-val">{{ Number(stock.score).toFixed(2) }}</span>
          <span class="score-label">AI 推荐分</span>
        </div>
        <div class="market-info">
          <div class="info-item">
            <span class="label">当前价格</span>
            <span class="value">{{ stock.price }}</span>
          </div>
          <div class="info-item">
            <span class="label">今日涨幅</span>
            <span class="value red">{{ `${stock.changePercent > 0 ? '+' : ''}${stock.changePercent}` }}%</span>
          </div>
        </div>
      </div>

      <!-- Analysis Reason -->
      <section class="reason-section">
        <div class="section-title">
          <span class="icon">💡</span> 上榜理由深度解析
        </div>
        <div class="reason-content" v-html="renderMarkdown(stock.deepReason || stock.reason)"></div>
      </section>

      <!-- Action Footer -->
      <div class="action-footer">
        <button @click="goToDiagnosis" class="diagnose-btn">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
          </svg>
          立即进行深度诊断
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.detail-container {
  min-height: 100vh;
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 80px;
}

@media (prefers-color-scheme: dark) {
  .detail-container { background-color: #121212; }
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  gap: 16px;
}

@media (prefers-color-scheme: dark) {
  .page-header {
    background: rgba(18, 18, 18, 0.95);
    border-bottom-color: #333;
    color: #e0e0e0;
  }
}

.back-btn {
  background: none;
  border: none;
  color: #333;
  padding: 8px;
  margin-left: -8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%;
}

@media (prefers-color-scheme: dark) {
  .back-btn { color: #e0e0e0; }
}

.header-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stock-name { font-weight: 700; font-size: 1.1rem; }
.stock-code { color: #666; font-size: 0.9rem; }

@media (prefers-color-scheme: dark) {
  .stock-name { color: #e0e0e0; }
  .stock-code { color: #999; }
}

.content-body {
  padding: 20px;
}

.score-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.08);
}

@media (prefers-color-scheme: dark) {
  .score-card {
    background: linear-gradient(135deg, #2a1a1a 0%, #331010 100%);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-val {
  font-size: 3rem;
  font-weight: 800;
  color: #d32f2f;
  line-height: 1;
  margin-bottom: 4px;
}

.score-label {
  font-size: 0.8rem;
  color: #d32f2f;
  opacity: 0.8;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .score-val, .score-label { color: #ff8a80; }
}

.market-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: right;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item .label {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 2px;
}

.info-item .value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.info-item .value.red {
  color: #d32f2f;
}

@media (prefers-color-scheme: dark) {
  .info-item .value { color: #e0e0e0; }
  .info-item .value.red { color: #ff8a80; }
}

.reason-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (prefers-color-scheme: dark) {
  .section-title { color: #e0e0e0; }
}

.reason-content {
  font-size: 1rem;
  line-height: 1.8;
  color: #444;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 16px;
}

@media (prefers-color-scheme: dark) {
  .reason-content {
    background-color: #1e1e1e;
    color: #ccc;
  }
}

.action-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}

@media (prefers-color-scheme: dark) {
  .action-footer {
    background: rgba(18, 18, 18, 0.9);
    border-top-color: #333;
  }
}

.diagnose-btn {
  width: 100%;
  max-width: 600px;
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.diagnose-btn:active {
  transform: scale(0.98);
}
</style>
