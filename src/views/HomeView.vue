<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const stockInput = ref('');
const error = ref('');

// Clear error when user starts typing
watch(stockInput, () => {
  if (error.value) error.value = '';
});

const handleStart = () => {
  const codes = stockInput.value
    .split(/[,，\s\n]+/)
    .map(c => c.trim())
    .filter(c => c.length > 0);

  if (codes.length === 0) {
    error.value = '请输入至少一个股票代码';
    return;
  }

  // Navigate to result page with codes as query parameter
  router.push({ 
    name: 'result', 
    query: { codes: codes.join(',') } 
  });
};

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleStart();
  }
};
</script>

<template>
  <div class="home-container">
    <div class="content-wrapper">
      <div class="greeting-container">
        <h2 class="greeting-sub">
          <span class="highlight">A股热心股民,</span> 你好,
        </h2>
        <h1 class="greeting-main">
          让我来帮你分析一下你的意向股票吧!
        </h1>
      </div>

      <div class="input-area">
        <div class="input-wrapper">
          <textarea 
            v-model="stockInput" 
            @keydown="handleKeydown"
            placeholder="输入股票代码 (例如: 600519, 000858)"
            class="gemini-input"
            rows="3"
          ></textarea>
          <button @click="handleStart" class="gemini-btn">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
              <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
            </svg>
            <span class="btn-text">开始智能分析</span>
          </button>
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.content-wrapper {
  width: 100%;
  max-width: 800px;
}

.greeting-container {
  text-align: left;
  margin-bottom: 40px;
  padding-left: 10px; /* Slight alignment adjustment */
}

.greeting-sub {
  font-size: 2rem;
  font-weight: 400;
  margin: 0 0 10px 0;
  color: #666;
}

.greeting-main {
  font-size: 3rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.2;
  background: -webkit-linear-gradient(45deg, #d32f2f, #35495e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (prefers-color-scheme: light) {
  .greeting-main {
    background: -webkit-linear-gradient(45deg, #2c3e50, #d32f2f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

@media (prefers-color-scheme: dark) {
  .greeting-sub { color: #aaa; }
}

.highlight {
  font-weight: bold;
}

.input-area {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.input-wrapper {
  position: relative;
  background-color: #f0f4f9;
  border-radius: 24px; /* More rectangular but rounded corners for textarea look */
  padding: 16px;
  transition: background-color 0.2s, box-shadow 0.2s;
  /* Min-height to ensure roughly 3 lines + bottom button space area */
  min-height: 160px; 
  display: flex;
  flex-direction: column;
}

.input-wrapper:focus-within {
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

@media (prefers-color-scheme: dark) {
  .input-wrapper {
    background-color: #1e1e1e;
    border: 1px solid #444;
  }
  .input-wrapper:focus-within {
    background-color: #2a2a2a;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
}

.gemini-input {
  width: 100%;
  flex: 1; /* Take up available space */
  border: none;
  background: transparent;
  font-size: 1.2rem;
  outline: none;
  color: inherit;
  resize: none;
  font-family: inherit;
  /* Ensure text doesn't go under the button */
  padding-bottom: 60px; 
}

.gemini-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.gemini-btn:hover {
  background-color: #b71c1c;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
}

.gemini-btn svg {
  fill: currentColor;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .greeting-sub {
    font-size: 1.5rem;
  }
  .greeting-main {
    font-size: 2rem;
  }
  
  .gemini-btn {
    padding: 10px;
    border-radius: 50%; /* Circle button on mobile */
    right: 12px;
    bottom: 12px;
  }
  
  .btn-text {
    display: none; /* Hide text on mobile, just icon */
  }
}

.error-msg {
  margin-top: 16px;
  color: #ff6b6b;
  font-size: 0.9rem;
  text-align: center;
}
</style>
