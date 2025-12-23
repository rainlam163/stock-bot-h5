<script setup>
defineProps({
  text: {
    type: String,
    default: '你不要着急,我不是佩奇'
  }
})
</script>

<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-content {
    background-color: #2a2a2a;
    color: #e0e0e0;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983; /* Vue Green */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1em;
  font-weight: 500;
  color: #333;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .loading-text {
    color: #e0e0e0;
  }
}
</style>
