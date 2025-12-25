<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const stockInput = ref('');
const holdingStatus = ref('empty'); // 'empty' or 'holding'
const costPrice = ref('');
const quantity = ref('');
const profit = ref('');
const error = ref('');

// Clear error when user starts typing
watch([stockInput, costPrice, quantity], () => {
  if (error.value) error.value = '';
});

const isHolding = computed(() => holdingStatus.value === 'holding');

const handleStart = () => {
  const code = stockInput.value.trim();

  if (!code) {
    error.value = '请输入股票代码';
    return;
  }

  const queryParams = { 
    code,
    status: holdingStatus.value 
  };

  if (isHolding.value) {
    if (!costPrice.value || !quantity.value) {
      error.value = '请完善持仓成本和数量信息';
      return;
    }
    queryParams.cost = costPrice.value;
    queryParams.qty = quantity.value;
    queryParams.profit = profit.value || '0';
  }

  // Navigate to result page
  router.push({ 
    name: 'result', 
    query: queryParams
  });
};

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
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
          让我来帮你深度诊断你的股票!
        </h1>
      </div>

      <div class="input-area">
        <div class="input-card">
          <!-- Stock Code Input -->
          <div class="form-group">
            <label>股票代码</label>
            <input 
              v-model="stockInput" 
              @keydown.enter="handleStart"
              placeholder="例如: 600519"
              class="gemini-input"
              type="text"
            />
          </div>

          <!-- Holding Status Toggle -->
          <div class="form-group">
            <label>持仓状态</label>
            <div class="toggle-group">
              <label class="toggle-btn" :class="{ active: holdingStatus === 'empty' }">
                <input type="radio" value="empty" v-model="holdingStatus" />
                空仓观望
              </label>
              <label class="toggle-btn" :class="{ active: holdingStatus === 'holding' }">
                <input type="radio" value="holding" v-model="holdingStatus" />
                持有该股
              </label>
            </div>
          </div>

          <!-- Holding Details (Conditional) -->
          <transition name="slide-fade">
            <div v-if="isHolding" class="holding-details">
              <div class="detail-row">
                <div class="form-group half">
                  <label>持仓成本 (元)</label>
                  <input type="number" v-model="costPrice" placeholder="0.00" class="gemini-input-sm" />
                </div>
                <div class="form-group half">
                  <label>持仓数量 (股)</label>
                  <input type="number" v-model="quantity" placeholder="0" class="gemini-input-sm" />
                </div>
              </div>
              <div class="form-group">
                <label>当前盈亏 (元) <span class="optional">(可选)</span></label>
                <input type="number" v-model="profit" placeholder="+2000 或 -500" class="gemini-input-sm" />
              </div>
            </div>
          </transition>

          <button @click="handleStart" class="gemini-btn">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
              <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
            </svg>
            <span class="btn-text">开始智能诊股</span>
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
  justify-content: flex-start;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  padding-top: 120px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.content-wrapper {
  width: 100%;
  max-width: 600px;
}

.greeting-container {
  text-align: left;
  margin-bottom: 30px;
  padding-left: 10px;
}

.greeting-sub {
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 5px 0;
  color: #666;
}

.greeting-main {
  font-size: 2.2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  background: -webkit-linear-gradient(45deg, #d32f2f, #35495e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.input-card {
  background-color: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

@media (prefers-color-scheme: dark) {
  .input-card {
    background-color: #1e1e1e;
    border-color: #333;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .greeting-sub { color: #aaa; }
  .greeting-main {
    background: -webkit-linear-gradient(45deg, #eee, #ff5252);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.form-group label:not(.toggle-btn) {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  margin-left: 4px;
}

@media (prefers-color-scheme: dark) {
  .form-group label { color: #ccc; }
}

.gemini-input, .gemini-input-sm {
  width: 100%;
  padding: 12px 16px;
  font-size: 1.1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f9f9f9;
  outline: none;
  transition: border-color 0.2s, background-color 0.2s;
  color: inherit;
  box-sizing: border-box;
}

.gemini-input:focus, .gemini-input-sm:focus {
  border-color: #d32f2f;
  background-color: #fff;
}

@media (prefers-color-scheme: dark) {
  .gemini-input, .gemini-input-sm {
    background-color: #2a2a2a;
    border-color: #444;
    color: white;
  }
  .gemini-input:focus, .gemini-input-sm:focus {
    border-color: #ff5252;
    background-color: #333;
  }
}

.toggle-group {
  display: flex;
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 8px 4px
  ;
  width: 100%;
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  .toggle-group { background-color: #2a2a2a; }
}

.toggle-btn {
  flex: 1;
  text-align: center;
  height: 38px; /* Fixed height for consistency */
  cursor: pointer;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #666;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle-btn input {
  display: none;
}

.toggle-btn.active {
  background-color: white;
  color: #d32f2f;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (prefers-color-scheme: dark) {
  .toggle-btn.active {
    background-color: #444;
    color: #ff5252;
  }
  .toggle-btn { color: #aaa; }
}

.detail-row {
  display: flex;
  gap: 16px;
}

.half {
  flex: 1;
}

.optional {
  font-weight: normal;
  color: #999;
  font-size: 0.8rem;
}

.gemini-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.gemini-btn:hover {
  background-color: #b71c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.error-msg {
  margin-top: 16px;
  color: #ff4444;
  font-size: 0.9rem;
  text-align: center;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
