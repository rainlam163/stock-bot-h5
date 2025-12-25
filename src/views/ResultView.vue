<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import Loading from '../components/Loading.vue';

const route = useRoute();
const router = useRouter();

const results = ref([]);
const loading = ref(false);
const error = ref('');
const finalReport = ref('');

const API_URL = '/api/analyze';

const goBack = () => {
  router.push('/');
};

const analyzeStock = async (code, holdingInfo) => {
  // Reset state
  results.value = [];
  finalReport.value = '';
  error.value = '';
  loading.value = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        code, 
        holdingInfo 
      }),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    results.value = data.results || [];
    finalReport.value = data.finalReport || '';
  } catch (err) {
    error.value = err.message || '发生未知错误';
  } finally {
    loading.value = false;
  }
};

const renderMarkdown = (text) => {
  return marked.parse(text || '');
};

onMounted(() => {
  const code = route.query.code;
  const status = route.query.status || 'empty';
  
  if (!code) {
    router.replace('/');
    return;
  }

  let holdingInfo = null;
  if (status === 'holding') {
    holdingInfo = {
      status: 'holding',
      cost: Number(route.query.cost),
      quantity: Number(route.query.qty),
      profit: Number(route.query.profit) || 0
    };
  } else {
    holdingInfo = { status: 'empty' };
  }

  analyzeStock(code, holdingInfo);
});
</script>

<template>
  <div class="result-container">
    <!-- Loading Component -->
    <div v-if="loading" class="loading-wrapper">
      <Loading />
      <p class="loading-text">正在深入分析市场数据，请稍候...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-msg">
      {{ error }}
      <button @click="goBack" class="retry-btn">返回重试</button>
    </div>

    <!-- Results List -->
    <div v-if="!loading && (results.length > 0 || finalReport)" class="results-content">
      
      <!-- Final Report -->
      <div v-if="finalReport" class="report-card">
        <div class="report-header">
           <h3>综合分析报告</h3>
        </div>
        <div class="report-body" v-html="renderMarkdown(finalReport)"></div>
      </div>

      <!-- Individual Stock Cards -->
      <div v-for="item in results" :key="item.code" class="result-card">
        <div class="card-header">
          <span class="stock-name">{{ item.name }}</span>
          <span class="stock-code">({{ item.code }})</span>
        </div>
        <div class="card-body">
          <div v-if="item.error" class="item-error">{{ item.error }}</div>
          <div v-else class="advice-content" v-html="renderMarkdown(item.advice)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 80vh;
}

.loading-text {
  margin-top: 20px;
  color: #666;
}

.error-msg {
  text-align: center;
  color: #ff4444;
  padding: 20px;
  background-color: #ffe6e6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.retry-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.report-card, .result-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid #eee;
}

@media (prefers-color-scheme: dark) {
  .report-card, .result-card {
    background: #1e1e1e;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 1px solid #333;
  }
}

.report-header {
  background: linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%);
  color: white;
  padding: 15px 20px;
}

.report-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.report-body {
  padding: 20px;
  font-size: 15px;
  line-height: 1.6;
  color: #2c3e50;
}

.card-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

@media (prefers-color-scheme: dark) {
  .card-header {
    background-color: #2a2a2a;
    border-bottom: 1px solid #444;
  }
}

.stock-name {
  font-size: 1.2em;
  font-weight: bold;
  color: #2c3e50;
}

@media (prefers-color-scheme: dark) {
  .stock-name { color: #e0e0e0; }
}

.stock-code {
  color: #666;
  font-size: 0.9em;
}

.card-body {
  padding: 20px;
}

.advice-content, .report-body {
  /* Common Markdown Styles */
  font-family: inherit;
}

.advice-content :deep(h1), .advice-content :deep(h2),
.report-body :deep(h1), .report-body :deep(h2) {
  font-size: 1.3em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #2c3e50;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 5px;
}

.advice-content :deep(h3), .advice-content :deep(h4),
.report-body :deep(h3), .report-body :deep(h4) {
  font-size: 1.1em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #34495e;
  font-weight: 600;
}

.advice-content :deep(p), .report-body :deep(p) {
  margin-bottom: 1em;
}

.advice-content :deep(ul), .report-body :deep(ul),
.advice-content :deep(ol), .report-body :deep(ol) {
  padding-left: 20px;
  margin-bottom: 1em;
}

.advice-content :deep(li), .report-body :deep(li) {
  margin-bottom: 0.5em;
}

.advice-content :deep(strong), .report-body :deep(strong) {
  color: #d32f2f;
  font-weight: 700;
}

.advice-content :deep(blockquote), .report-body :deep(blockquote) {
  border-left: 4px solid #d32f2f;
  margin: 1em 0;
  padding-left: 1em;
  color: #555;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 0 4px 4px 0;
}

@media (prefers-color-scheme: dark) {
  .report-body, .advice-content { color: #d0d0d0; }
  
  .advice-content :deep(h1), .advice-content :deep(h2),
  .report-body :deep(h1), .report-body :deep(h2) {
    color: #e0e0e0;
    border-bottom-color: #444;
  }

  .advice-content :deep(h3), .advice-content :deep(h4),
  .report-body :deep(h3), .report-body :deep(h4) {
    color: #ccc;
  }
  
  .advice-content :deep(strong), .report-body :deep(strong) {
    color: #ff8a80;
  }

  .advice-content :deep(blockquote), .report-body :deep(blockquote) {
    background-color: #2a2a2a;
    color: #aaa;
    border-left-color: #b71c1c;
  }
}

.item-error {
  color: #ff6b6b;
}
</style>
