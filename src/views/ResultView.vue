<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';

const route = useRoute();
const router = useRouter();

const results = ref([]);
const loading = ref(false);
const error = ref('');
const finalReport = ref('');
const isAutoScrollEnabled = ref(true);

const API_URL = '/api/analyze';

const goBack = () => {
  router.back();
};

const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const clientHeight = document.documentElement.clientHeight;
  
  // 如果距离底部小于 100px，则开启自动滚动
  isAutoScrollEnabled.value = (scrollHeight - scrollTop - clientHeight) < 100;
};

const scrollToBottom = () => {
  if (!isAutoScrollEnabled.value) return;
  
  nextTick(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  });
};

const handleStreamMessage = (msg) => {
  loading.value = false; // Stop main loading on first message received
  
  switch (msg.type) {
    case 'meta':
      finalReport.value = msg.data.finalReport;
      scrollToBottom();
      break;
    case 'start':
      // Init a new result card if not exists
      if (!results.value.find(r => r.code === msg.data.code)) {
        results.value.push({
          code: msg.data.code,
          name: msg.data.name,
          advice: '', // Start empty, will stream in
          isStreaming: true
        });
      }
      scrollToBottom();
      break;
    case 'chunk':
      // Append text to the current stock
      if (results.value.length > 0) {
        results.value[0].advice += msg.data;
        scrollToBottom();
      }
      break;
    case 'error':
      if (results.value.length > 0) {
        results.value[0].error = msg.data;
        results.value[0].isStreaming = false;
      } else {
        error.value = msg.data;
      }
      scrollToBottom();
      break;
    case 'done':
      // Stream finished
      if (results.value.length > 0) {
        results.value[0].isStreaming = false;
      }
      break;
  }
};

const analyzeStock = async (code, holdingInfo, isDeep) => {
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
        holdingInfo,
        isDeep
      }),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          handleStreamMessage(msg);
        } catch (e) {
          console.warn("Stream parse error:", e, line);
        }
      }
    }
  } catch (err) {
    error.value = err.message || '发生未知错误';
  } finally {
    loading.value = false;
    if (results.value.length > 0) {
      results.value[0].isStreaming = false;
    }
  }
};

const renderMarkdown = (text) => {
  return marked.parse(text || '');
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
  const code = route.query.code;
  const status = route.query.status || 'empty';
  const isDeep = route.query.isDeep === '1';
  
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

  analyzeStock(code, holdingInfo, isDeep);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="result-container">
    <!-- Header with Back Button -->
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="返回">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div v-if="results.length > 0" class="header-title">
        <span class="stock-name">{{ results[0].name }}</span>
        <span class="stock-code">{{ results[0].code }}</span>
      </div>
    </header>

    <!-- Blinking Cursor (Initial Connection State) -->
    <div v-if="loading && !finalReport && results.length === 0" class="waiting-container">
      <div class="waiting-skeleton">
        <div class="waiting-cursor"></div>
        <p class="waiting-text">正在建立量化数据连接...</p>
      </div>
      <p class="generating-indicator">正在抓取实时行情、技术指标与市场舆情...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-msg">
      {{ error }}
      <button @click="goBack" class="retry-btn">返回重试</button>
    </div>

    <!-- Results Feed -->
    <main v-if="finalReport || results.length > 0" class="results-feed">
      
      <!-- Metadata / Final Report Header -->
      <section v-if="finalReport" class="report-section">
        <div class="section-label">基础信息与环境</div>
        <div class="report-body" v-html="renderMarkdown(finalReport)"></div>
      </section>

      <!-- Analysis Content -->
      <section v-for="item in results" :key="item.code" class="analysis-section">
        <div class="section-label">AI 深度分析与策略</div>
        <div class="analysis-body">
          <div v-if="item.error" class="item-error">{{ item.error }}</div>
          <div v-else class="advice-wrapper">
             <div class="advice-content" v-html="renderMarkdown(item.advice)"></div>
             <span v-if="item.isStreaming" class="streaming-cursor"></span>
             <div v-if="!item.advice && item.isStreaming" class="generating-indicator">
                AI 正在处理量化因子并撰写报告...
             </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.result-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  background-color: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

@media (prefers-color-scheme: dark) {
  .result-container {
    background-color: #121212;
    color: #e0e0e0;
  }
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  gap: 16px;
}

@media (prefers-color-scheme: dark) {
  .page-header {
    background: rgba(18, 18, 18, 0.9);
    border-bottom-color: #333;
  }
}

.back-btn {
  background: none;
  border: none;
  color: #333;
  padding: 8px;
  margin-left: -8px; /* Offset padding to align with edge */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background-color 0.2s;
  border-radius: 50%;
}

.back-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .back-btn {
    color: #e0e0e0;
  }
  .back-btn:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.back-icon {
  display: block;
}

.header-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stock-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.stock-code {
  font-size: 0.85rem;
  color: #666;
}

.waiting-container {
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
  gap: 12px;
}

.waiting-skeleton {
  display: flex;
  align-items: center;
  gap: 8px;
}

.waiting-cursor {
  width: 2px;
  height: 1.2em;
  background-color: #d32f2f;
  animation: blink 1s step-end infinite;
}

.waiting-text {
  color: #666;
  font-size: 0.95rem;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

.error-msg {
  text-align: center;
  color: #ff4444;
  padding: 40px 20px;
}

.retry-btn {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  margin-top: 16px;
  cursor: pointer;
}

.results-feed {
  padding: 0;
}

.section-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 0.5px;
  font-weight: 700;
  padding: 16px 16px 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label::before {
  content: "";
  display: block;
  width: 3px;
  height: 12px;
  background-color: #d32f2f;
  border-radius: 2px;
}

@media (prefers-color-scheme: dark) {
  .section-label {
    color: #666;
  }
}

.report-section, .analysis-section {
  border-bottom: 1px solid #eee;
}

@media (prefers-color-scheme: dark) {
  .report-section, .analysis-section {
    border-bottom: 1px solid #222;
  }
}

.report-body, .analysis-body {
  padding: 0 16px;
  font-size: 15px;
  line-height: 1.7;
}

.advice-wrapper {
  position: relative;
}

.advice-content :deep(h4) {
  margin: 1em 0 0.5em;
  font-size: 1.05rem;
  color: #d32f2f;
  font-weight: 700;
}

@media (prefers-color-scheme: dark) {
  .advice-content :deep(h4) {
    color: #ff8a80;
  }
}

.advice-content :deep(p) {
  margin-bottom: 1em;
}

.advice-content :deep(ul), .advice-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 1.2em;
}

.advice-content :deep(li) {
  margin-bottom: 0.6em;
}

.advice-content :deep(strong) {
  font-weight: 700;
  color: #000;
}

@media (prefers-color-scheme: dark) {
  .advice-content :deep(strong) {
    color: #fff;
  }
}

.advice-content :deep(blockquote) {
  border-left: 4px solid #d32f2f;
  margin: 1.2em 0;
  padding: 12px 16px;
  background-color: #fef2f2;
  border-radius: 0 8px 8px 0;
}

@media (prefers-color-scheme: dark) {
  .advice-content :deep(blockquote) {
    background-color: #2a1a1a;
    color: #ccc;
  }
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background-color: #d32f2f;
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 1s step-end infinite;
}

.generating-indicator {
  color: #999;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 12px;
}

.item-error {
  color: #ff4444;
  padding: 16px;
}
</style>