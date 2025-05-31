<template>
  <div
    class="gradient-bg min-h-screen mx-auto px-4 py-12 flex flex-col items-center justify-center"
    style="font-family: Roboto">
    <slot />

    <div
      class="absolute bottom-8 text-center text-lg flex flex-col items-center justify-center text-gray-500">
      <div>
        Made with love by
        <a href="https://nichijou.moe/" target="_blank">Hexzii</a>
      </div>
      <a
        href="https://github.com/hexadecimal233/morse-code-playground"
        target="_blank">
        <Icon name="simple-icons:github" class="mr-2" />
        Source Code
      </a>
    </div>
  </div>
</template>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
