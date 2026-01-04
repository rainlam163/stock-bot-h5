<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const stocks = ref([]);
const loading = ref(true);
const error = ref('');

const API_URL = '/api/recommend';

const fetchRecommendations = async () => {
  loading.value = true;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('获取推荐列表失败');
    
    let data = await response.json();
    
    // 如果数据为空，可能是后台还没跑任务
    if (!data || data.length === 0) {
       error.value = '暂无最新选股数据，请点击重试以触发更新';
       stocks.value = [];
       return;
    }

    stocks.value = data; // 数据库取出的通常已经是排好序的

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
     // 调用触发接口 (需要等待较长时间)
     const res = await fetch('/api/trigger-selection', { method: 'POST' });
     if (!res.ok) throw new Error('触发更新失败');
     
     // 触发成功后，重新获取列表
     await fetchRecommendations();
  } catch (err) {
     error.value = '更新超时或失败，请稍后重试';
  } finally {
     loading.value = false;
  }
};

const goToDetail = (stock) => {
  router.push({
    path: '/detail',
    state: { stock: JSON.stringify(stock) }
  });
};

const goToDiagnosis = (e, code) => {
  e.stopPropagation(); // Prevent card click
  router.push({
    path: '/',
    query: { code }
  });
};

const goBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchRecommendations();
});
</script>

<template>
  <div class="recommend-container">
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="返回">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="header-title">
        <span class="title-text">智能选股榜单 (Top 20)</span>
      </div>
    </header>

    <main class="list-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在通过量化模型筛选全市场...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="triggerUpdate" class="retry-btn">立即更新数据</button>
      </div>

      <div v-else class="stock-list">
        <div 
          v-for="(stock, index) in stocks" 
          :key="stock.code" 
          class="stock-item"
          @click="goToDetail(stock)"
        >
          <!-- Left: Rank & Info -->
          <div class="item-left">
            <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <div class="stock-info">
              <div class="info-top">
                <span class="stock-name">{{ stock.name }}</span>
                <span class="stock-code">{{ stock.code }}</span>
              </div>
              <div class="stock-reason">{{ stock.reason }}</div>
            </div>
          </div>
          
          <!-- Right: Score & Action -->
          <div class="item-right">
             <div class="stock-score">
               <span class="score-val">{{ stock.score }}</span>
               <span class="score-unit">分</span>
             </div>
             <button class="action-btn" @click="(e) => goToDiagnosis(e, stock.code)">
               去诊股
             </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.recommend-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

@media (prefers-color-scheme: dark) {
  .recommend-container { background-color: #121212; }
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

.stock-item {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid transparent;
}

.stock-item:active {
  transform: scale(0.98);
  background-color: #fafafa;
}

@media (prefers-color-scheme: dark) {
  .stock-item {
    background: #1e1e1e;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .stock-item:active { background-color: #252525; }
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
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

.rank-1 { background-color: #ffebee; color: #d32f2f; }
.rank-2 { background-color: #fff3e0; color: #f57c00; }
.rank-3 { background-color: #fff8e1; color: #fbc02d; }

@media (prefers-color-scheme: dark) {
  .rank-badge { background-color: #333; color: #aaa; }
  .rank-1 { background-color: #4a1a1a; color: #ff8a80; }
  .rank-2 { background-color: #4a3b1a; color: #ffcc80; }
  .rank-3 { background-color: #4a451a; color: #ffe082; }
}

.stock-info {
  flex: 1;
  min-width: 0;
}

.info-top {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}

.stock-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stock-code {
  font-size: 0.8rem;
  color: #999;
}

@media (prefers-color-scheme: dark) {
  .stock-name { color: #e0e0e0; }
  .stock-code { color: #666; }
}

.stock-reason {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (prefers-color-scheme: dark) {
  .stock-reason { color: #aaa; }
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.stock-score {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.score-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #d32f2f;
  line-height: 1;
}

.score-unit {
  font-size: 0.7rem;
  color: #d32f2f;
  opacity: 0.8;
}

@media (prefers-color-scheme: dark) {
  .score-val, .score-unit { color: #ff8a80; }
}

.action-btn {
  background-color: transparent;
  border: 1px solid #d32f2f;
  color: #d32f2f;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.action-btn:active {
  background-color: #d32f2f;
  color: white;
}

@media (prefers-color-scheme: dark) {
  .action-btn {
    border-color: #ff5252;
    color: #ff5252;
  }
  .action-btn:active {
    background-color: #ff5252;
    color: #121212;
  }
}

/* Loading & Error */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
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

.retry-btn {
  padding: 8px 20px;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}
</style>