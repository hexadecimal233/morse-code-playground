<template>
  <div
    class="gradient-bg min-h-screen mx-auto px-4 py-12 flex flex-col"
    style="font-family: Roboto">
    <div class="flex-grow flex flex-col items-center justify-center">
      <slot />
    </div>
    <div
      class="pt-8 pb-4 text-lg flex flex-col items-center justify-center text-gray-500 space-y-2">
      <div class="text-center px-4">
        Made with love by
        <a href="https://nichijou.moe/" target="_blank">Hexzii</a>
      </div>
      <a
        href="https://github.com/hexadecimal233/morse-code-playground"
        target="_blank"
        class="flex items-center">
        <Icon name="simple-icons:github" class="mr-2" />
        Source Code
      </a>
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";
.gradient-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

a {
  @apply text-gray-500 hover:text-gray-700 underline;
}
</style>
