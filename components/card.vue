<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover max-w-md min-w-full mx-auto p-6 text-center">
    <slot />
  </div>
</template>

<style scoped>
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
