<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sectors = ref([]);
const updatedAt = ref('');
const loading = ref(true);
const error = ref('');

const API_URL = '/api/sector-predictions';

const fetchSectors = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('获取预测数据失败');
    
    const data = await response.json();
    
    if (!data.list || data.list.length === 0) {
       error.value = '暂无最新预测数据，预测结果每天 08:30 和 15:30 更新';
       sectors.value = [];
       return;
    }

    sectors.value = data.list;
    updatedAt.value = data.updatedAt;

  } catch (err) {
    error.value = err.message || '网络请求错误';
  } finally {
    loading.value = false;
  }
};

const triggerUpdate = async () => {
  loading.value = true;
  error.value = '';
  try {
     const res = await fetch('/api/trigger-sector-selection', { method: 'POST' });
     if (!res.ok) throw new Error('触发预测失败');
     await fetchSectors();
  } catch (err) {
     error.value = '计算超时或失败，请稍后重试';
  } finally {
     loading.value = false;
  }
};

const goBack = () => {
  router.push('/');
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString();
};

onMounted(() => {
  fetchSectors();
});
</script>

<template>
  <div class="sector-container">
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="返回">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="header-title">
        <span class="title-text">行业板块预测 (Top 5)</span>
      </div>
    </header>

    <main class="list-content">
      <!-- Notice -->
      <div class="notice-card">
        <div class="notice-icon">🕒</div>
        <div class="notice-text">
          <p>预测结果每天 <strong>08:30</strong> (开盘前) 和 <strong>15:30</strong> (收盘后) 自动更新。</p>
          <p v-if="updatedAt" class="update-time">最后更新时间: {{ formatDate(updatedAt) }}</p>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在分析全球市场与板块动能...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="triggerUpdate" class="retry-btn">立即更新数据</button>
      </div>

      <div v-else class="sector-list">
        <div 
          v-for="(item, index) in sectors" 
          :key="item.id" 
          class="sector-item"
        >
          <div class="item-header">
            <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <div class="sector-info-main">
              <div class="sector-name">{{ item.sector_name }}</div>
              <div class="sector-code">{{ item.sector_code }}</div>
            </div>
            <div class="sector-score">
              <span class="score-val">{{ item.score }}</span>
              <span class="score-label">综合评分</span>
            </div>
          </div>
          
          <div class="item-body">
            <!-- 6 Dimensions Grid -->
            <div class="dimensions-grid">
              <div class="dim-item">
                <span class="dim-label">景气度</span>
                <div class="dim-bar-bg"><div class="dim-bar-fill" :style="{ width: item.val_prosperity + '%' }"></div></div>
                <span class="dim-val">{{ item.val_prosperity }}</span>
              </div>
              <div class="dim-item">
                <span class="dim-label">低估值</span>
                <div class="dim-bar-bg"><div class="dim-bar-fill" :style="{ width: item.val_valuation + '%' }"></div></div>
                <span class="dim-val">{{ item.val_valuation }}</span>
              </div>
              <div class="dim-item">
                <span class="dim-label">资金流</span>
                <div class="dim-bar-bg"><div class="dim-bar-fill" :style="{ width: item.val_inflow + '%' }"></div></div>
                <span class="dim-val">{{ item.val_inflow }}</span>
              </div>
              <div class="dim-item">
                <span class="dim-label">净利增</span>
                <div class="dim-bar-bg"><div class="dim-bar-fill" :style="{ width: item.val_profit_growth + '%' }"></div></div>
                <span class="dim-val">{{ item.val_profit_growth }}</span>
              </div>
              <div class="dim-item">
                <span class="dim-label">健康度</span>
                <div class="dim-bar-bg"><div class="dim-bar-fill" :style="{ width: item.val_crowding + '%' }"></div></div>
                <span class="dim-val">{{ item.val_crowding }}</span>
              </div>
              <div class="dim-item">
                <span class="dim-label">趋势度</span>
                <div class="dim-bar-bg"><div class="dim-bar-fill" :style="{ width: item.val_trend + '%' }"></div></div>
                <span class="dim-val">{{ item.val_trend }}</span>
              </div>
            </div>

            <div class="prediction-reason">{{ item.prediction_reason }}</div>
            <div class="key-factors">
              <span class="factor-tag" v-for="f in item.key_factors.split('/')" :key="f">
                # {{ f.trim() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.sector-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 40px;
}

@media (prefers-color-scheme: dark) {
  .sector-container { background-color: #121212; }
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

.title-text {
  font-size: 1.1rem;
  font-weight: 700;
}

.list-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.notice-card {
  background-color: #e3f2fd;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid #bbdefb;
}

@media (prefers-color-scheme: dark) {
  .notice-card {
    background-color: #0d1b2a;
    border-color: #1e3a8a;
  }
}

.notice-icon { font-size: 1.2rem; }
.notice-text { font-size: 0.85rem; color: #1976d2; line-height: 1.5; }
.notice-text p { margin: 0; }
.update-time { font-size: 0.75rem; opacity: 0.8; margin-top: 4px !important; }

@media (prefers-color-scheme: dark) {
  .notice-text { color: #64b5f6; }
}

.sector-item {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

@media (prefers-color-scheme: dark) {
  .sector-item {
    background: #1e1e1e;
    border-color: #333;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.rank-1 { background-color: #fff3e0; color: #f57c00; }
.rank-2 { background-color: #fff8e1; color: #fbc02d; }

@media (prefers-color-scheme: dark) {
  .rank-badge { background-color: #333; color: #aaa; }
}

.sector-info-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sector-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
}

.sector-code {
  font-size: 0.75rem;
  color: #999;
  font-family: monospace;
}

@media (prefers-color-scheme: dark) {
  .sector-name { color: #e0e0e0; }
  .sector-code { color: #666; }
}

.dimensions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  background-color: #fcfcfc;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
}

@media (prefers-color-scheme: dark) {
  .dimensions-grid { background-color: #1a1a1a; }
}

.dim-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dim-label {
  font-size: 0.75rem;
  color: #666;
  width: 40px;
}

.dim-bar-bg {
  flex: 1;
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  .dim-bar-bg { background-color: #333; }
}

.dim-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff8a80, #d32f2f);
  border-radius: 2px;
}

.dim-val {
  font-size: 0.7rem;
  font-weight: 700;
  color: #d32f2f;
  width: 20px;
  text-align: right;
}

@media (prefers-color-scheme: dark) {
  .dim-val { color: #ff8a80; }
}

.sector-score {
  text-align: center;
  background-color: #fdf2f2;
  padding: 6px 10px;
  border-radius: 10px;
}

@media (prefers-color-scheme: dark) {
  .sector-score { background-color: #2a1a1a; }
}

.score-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: #d32f2f;
  line-height: 1;
  display: block;
}

.score-label {
  font-size: 0.6rem;
  color: #d32f2f;
  opacity: 0.8;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .score-val, .score-label { color: #ff8a80; }
}

.prediction-reason {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.6;
  margin-bottom: 16px;
}

@media (prefers-color-scheme: dark) {
  .prediction-reason { color: #ccc; }
}

.key-factors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.factor-tag {
  font-size: 0.75rem;
  background-color: #f5f5f5;
  color: #666;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .factor-tag { background-color: #2a2a2a; color: #999; }
}

/* Loading & Spinner */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
  color: #999;
  gap: 16px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #d32f2f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding-top: 60px;
  color: #ff4444;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}
</style>
