<template>
  <div
    class="flex flex-col items-center justify-center bg-blue-50 min-h-screen p-4">
    <div class="p-8 bg-white max-w-2xl rounded-2xl border-4 border-gray-100">
      <div
        class="flex items-center gap-3 text-4xl text-blue-400 font-bold mb-6 pb-4 border-b-2 border-blue-200">
        <Icon name="mdi:radio-tower" />
        <h1>Morse Code Playground</h1>
      </div>

      <div class="space-y-6 text-blue-400">
        <div>
          <input
            v-model="inputText"
            @input="stopMorseScript()"
            placeholder="Hello World"
            class="w-full p-3 rounded-lg border-2 border-blue-200 focus:outline-none focus:border-blue-300 bg-blue-50" />
        </div>

        <div class="space-y-2">
          <label class="block font-medium">播放速度 (WPM)</label>
          <input
            v-model="playWpm"
            type="range"
            min="5"
            max="30"
            class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
          <div class="text-right text-sm">{{ playWpm }} WPM</div>
        </div>

        <div class="space-y-2">
          <label class="block font-medium">音高频率 (Frequency)</label>
          <input
            v-model="playFreq"
            type="range"
            min="50"
            max="2000"
            class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
          <div class="text-right text-sm">{{ playFreq }} Hz</div>
        </div>

        <div class="space-y-2">
          <label class="block font-medium">音量大小 (Volume)</label>
          <input
            v-model="playVolume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
          <div class="text-right text-sm">{{ playVolume }}</div>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="playShowTextBeforeSound"
            type="checkbox"
            class="w-5 h-5 text-blue-400 rounded border-blue-300 focus:ring-blue-300" />
          <label>在播放前显示文本</label>
        </div>

        <!-- TODO: 更新样式 -->
        <div class="flex flex-row *:m-4 pt-2">
          <button
            @click="playMorseScript()"
            class="w-1/2 bg-blue-400 hover:bg-blue-300 border-blue-300 text-white font-medium shadowed-box">
            播放
          </button>
          <button
            @click="stopMorseScript()"
            class="w-1/2 bg-white hover:bg-blue-50 text-blue-400 border-blue-100 font-medium shadowed-box">
            停止
          </button>
        </div>
      </div>

      <div class="my-8 border-t-2 border-blue-200"></div>

      <div class="mb-6">
        <div class="flex items-start gap-2">
          <Icon
            name="mdi:information"
            class="text-blue-400 mt-0.5 flex-shrink-0" />
          <p class="text-blue-500">
            什么是摩斯电码 (Morse Code)？ 摩斯电码是一种用于通信的编码方式，使用
            "." 和 "-" 来表示字母和数字。
          </p>
        </div>
      </div>

      <div
        class="bg-blue-100 min-h-36 rounded-lg flex flex-col border-2 border-blue-200">
        <div
          class="p-4 font-mono text-xl flex items-center bg-blue-200 rounded-t-lg">
          <span class="text-blue-400">{{ typewriterText }}</span>
          <span class="text-blue-600 font-bold animate-pulse">
            {{ typewriterTextCurrent }}
          </span>
        </div>
        <div class="p-4 text-center text-blue-500 font-medium">
          Current Morse:
          <span class="font-bold">{{ currentCharMorseCode }}</span>
        </div>
      </div>
    </div>

    <div class="mt-8 mb-4 text-center text-blue-400">
      Made with ❤️ by
      <a href="https://nichijou.moe/" target="_blank">Hexzii</a>
      |
      <a
        href="https://github.com/hexadecimal233/morse-code-playground"
        target="_blank">
        <Icon name="simple-icons:github" class="text-black" />
        Source Code
      </a>
    </div>
  </div>
</template>

<style scoped>
@import "tailwindcss";

.shadowed-box {
  @apply py-3 px-6 rounded-lg p-4 border-r-8 border-b-8
  hover:border-r-0 hover:border-b-0 transition-all duration-75;
}
</style>

<script setup lang="ts">
// 字符映射表
const morseCode: Record<string, string> = { "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "$": "...-..-", "@": ".--.-.", " ": "/"}; // prettier-ignore

// 配置
const inputText = ref("Hello World")
const playWpm = ref(15)
const playFreq = ref(490)
const playVolume = ref(0.8)
const playShowTextBeforeSound = ref(true)

// 状态
const currentIdx = ref(0)
const isPlaying = ref(false)
const typewriterText = ref("")
const typewriterTextCurrent = ref("")
const currentCharMorseCode = ref("")
watchEffect(() => {
  // 更新打字机效果
  typewriterText.value = inputText.value.slice(
    0,
    currentIdx.value - 1 + (isPlaying.value ? 0 : 1)
  )

  let currentChar = inputText.value[Math.max(currentIdx.value - 1, 0)]
  if (isPlaying.value) {
    // FIXME: Spaces does not display
    typewriterTextCurrent.value = currentChar
    currentCharMorseCode.value = morseCode[currentChar.toUpperCase()]
  } else {
    typewriterTextCurrent.value = ""
    currentCharMorseCode.value = ""
  }
})

// WebAudio的东西
let audioContext: AudioContext | null = null
let gainNode: GainNode | null = null
let oscillator: OscillatorNode | null = null

onMounted(() => {
  initAudioContext()
})

// 初始化音频上下文
function initAudioContext() {
  if (!audioContext) {
    // @ts-ignore
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  if (!gainNode) {
    gainNode = audioContext.createGain()
    gainNode.gain.value = 0
    gainNode.connect(audioContext.destination)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  }

  if (!oscillator) {
    oscillator = audioContext.createOscillator()
    oscillator.type = "sine"
    oscillator.connect(gainNode)
    oscillator.start()
  }
}

// 播放正弦波
function playSine(freq: number, duration: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const attack = 0.005
    const decay = 0.005

    initAudioContext()

    if (!audioContext || !gainNode || !oscillator) {
      return false
    }

    oscillator.frequency.value = freq

    // ATK
    // TODO: Realtime Gain modification
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(
      1 * playVolume.value,
      audioContext.currentTime + attack
    )

    // SUS + DEC
    gainNode.gain.setValueAtTime(
      1 * playVolume.value,
      audioContext.currentTime + attack + duration - decay
    )
    gainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + attack + duration
    )

    // 在音频播放完成后解析 Promise
    setTimeout(() => {
      resolve(true)
    }, (attack + duration) * 1000)

    return true
  })
}

// 播放字符
async function playMorseChar(char: string) {
  // 计算时长 (1 dash = 3 dots)

  const timeUnit = 1.2 / playWpm.value
  const dotDuration = timeUnit
  const dashDuration = 3 * timeUnit
  const symbolSpace = timeUnit
  const letterSpace = 3 * timeUnit - symbolSpace // 3 units total, minus last symbol space
  const wordSpace = 7 * timeUnit - symbolSpace // 7 units total, minus last symbol space

  const convertedChar = morseCode[char]

  // 单词间隔
  if (convertedChar === "/") {
    await new Promise((resolve) => setTimeout(resolve, wordSpace * 1000))
    return
  }

  // 播放字符
  for (let i = 0; i < convertedChar.length; i++) {
    const char = convertedChar[i]

    // 不是点就是杠
    await playSine(playFreq.value, char === "." ? dotDuration : dashDuration)

    await new Promise((resolve) => setTimeout(resolve, symbolSpace * 1000))
  }

  // 字母间隔
  await new Promise((resolve) => setTimeout(resolve, letterSpace * 1000))
}

async function playMorseScript() {
  isPlaying.value = true
  currentIdx.value = 0

  while (currentIdx.value < inputText.value.length && isPlaying.value) {
    let char = inputText.value[currentIdx.value].toUpperCase() // 获取当前大写字符

    if (playShowTextBeforeSound.value) currentIdx.value++

    await playMorseChar(char)

    if (!playShowTextBeforeSound.value) currentIdx.value++
  }

  // 确保最后一个字符显示完整
  if (!isPlaying.value && currentIdx.value === inputText.value.length - 1) {
    currentIdx.value++
  }

  isPlaying.value = false
}

function stopMorseScript() {
  isPlaying.value = false
}

// TODO: 自定义采样播放
</script>
