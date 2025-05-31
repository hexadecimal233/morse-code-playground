<template>
  <link rel="preconnect" href="https://avatars.githubusercontent.com" />
  <!-- Header -->
  <div class="text-center mb-12">
    <p class="text-4xl font-bold text-gray-800 mb-2">
      <Icon name="simple-icons:github" />
      Github 互关查找工具
    </p>
    <p class="text-gray-600 max-w-2xl mx-auto">
      查找你（和你关注列表里）的互关用户！
    </p>
  </div>

  <!-- Main Form -->
  <div
    class="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 mb-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div>
        <p class="block text-sm font-medium text-gray-700 mb-1">
          <Icon name="mdi:key" class="mr-2" />
          GitHub Token
        </p>
        <div class="relative">
          <input
            type="password"
            v-model="ghToken"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus focus:outline-none focus:border-blue-500" />
        </div>
        <p class="mt-1 text-xs text-gray-500">
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            class="text-blue-500 hover:underline">
            获取Token
          </a>
        </p>
      </div>

      <div>
        <p class="block text-sm font-medium text-gray-700 mb-1">
          <Icon name="mdi:account" class="mr-2" />
          查找的用户
        </p>
        <input
          type="text"
          v-model="mainUser"
          placeholder="e.g. octocat"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus focus:outline-none focus:border-blue-500" />
      </div>

      <div>
        <p class="block text-sm font-medium text-gray-700 mb-1">
          <Icon name="mdi:filter" class="mr-2" />
          个人最大关注数
        </p>
        <div class="relative">
          <input
            type="number"
            v-model="maxFollowing"
            placeholder="500"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus focus:outline-none focus:border-blue-500" />
          <span class="absolute right-3 top-2 text-gray-500">users</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <button
        @click="main()"
        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
        <Icon name="mdi:account-search" class="mr-2" />
        开始寻找
      </button>
      <button
        @click="clearCache()"
        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
        <Icon name="mdi:trash-can" class="mr-2" />
        清除缓存
      </button>
    </div>

    <div v-show="errorMessage" class="text-red-600 text-center mt-4">
      {{ errorMessage }}
    </div>
  </div>

  <!-- Results Section -->
  <div class="max-w-7xl mx-auto">
    <p class="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
      <Icon name="mdi:account-multiple" class="mr-2" />
      互关用户
      <span
        class="ml-auto text-sm font-normal bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
        {{ mutualLinks.length }} 个互关用户
      </span>
    </p>

    <div
      v-if="mutualLinks.length > 0 || loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="(item, index) in mutualLinks" :key="index">
        <div class="flex justify-center -space-x-3 mb-4">
          <a
            :href="`http://github.com/${user}`"
            v-for="user in item"
            :key="user">
            <div class="group relative inline-block">
              <NuxtImg
                :src="`https://avatars.githubusercontent.com/u/${userIdCache.get(
                  user
                )}`"
                class="w-16 h-16 rounded-full border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                loading="lazy" />
              <div
                class="absolute inset-0 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </a>
        </div>

        <p class="text-lg font-semibold text-gray-800 mb-1">
          {{ item.join(" & ") }}
        </p>
        <p
          class="inline-flex items-center text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100"
          @click="
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            })
          ">
          <Icon name="mdi:heart" class="mr-2" />
          xm
        </p>
      </Card>

      <!-- 转圈place holder -->
      <Card v-if="loading">
        <div class="text-6xl text-gray-300 mb-4">
          <Icon name="mdi:loading" class="animate-spin text-blue-600" />
        </div>
        <p class="text-xl font-medium text-gray-700 mb-2">寻找中 \ (・ω・)/</p>
        <p class="text-gray-500 mb-6">{{ progressText[0] }}</p>
        <p class="text-gray-500 mb-6">{{ progressText[1] }}</p>
      </Card>

      <!-- Empty State -->
    </div>
    <Card v-else>
      <div class="text-6xl text-gray-300 mb-4">
        <Icon name="mdi:account-multiple" class="mr-2" />
      </div>
      <p class="text-xl font-medium text-gray-700 mb-2">无互关用户😭</p>
      <p class="text-gray-500 mb-6">孩子们点点关注吧！</p>
    </Card>
  </div>
</template>

<style scoped>
.input-focus:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
</style>

<script setup lang="ts">
import { Icon } from "#components"
import { Octokit } from "octokit"
import { CachedMap } from "~/utils/CachedMap"
import confetti from "canvas-confetti"

const ghToken = ref(localStorage.getItem("ghToken") ?? "")
const mainUser = ref("")
const maxFollowing = ref(500)
const loading = ref(false)
const progressText = ref(["", ""])
const errorMessage = ref("")

watch(ghToken, () => {
  localStorage.setItem("ghToken", ghToken.value)
})

class UserGraph {
  nodes: Map<string, string[]> = new Map()

  // 添加单向关系
  addRelationship(fromUser: string, toUser: string): void {
    if (!this.nodes.has(fromUser)) {
      this.nodes.set(fromUser, [])
    }
    const relationships = this.nodes.get(fromUser)!
    if (!relationships.includes(toUser)) {
      relationships.push(toUser)
    }
  }

  clear(): void {
    this.nodes.clear()
  }

  // 检查两个用户是否有双向关系
  hasMutualRelationship(user1: string, user2: string): boolean {
    const user1Follows = this.nodes.get(user1) || []
    const user2Follows = this.nodes.get(user2) || []

    return user1Follows.includes(user2) && user2Follows.includes(user1)
  }

  // 获取双向关系
  getMutualLinks(): [string, string][] {
    const pairs: [string, string][] = []

    const users = Array.from(this.nodes.keys())

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const userA = users[i]
        const userB = users[j]

        if (this.hasMutualRelationship(userA, userB)) {
          pairs.push([userA, userB])
        }
      }
    }

    return pairs
  }
}

let octokit = new Octokit()

const userGraph = reactive(new UserGraph())
const mutualLinks = computed(() => userGraph.getMutualLinks())
const userCache = new CachedMap<string, string[]>("cache")
const userIdCache = new CachedMap<string, number>("userIdCache")
const ratelimitData = {
  limit: 5000,
  remaining: 5000,
  reset: 0,
}

async function getFollowings(
  username: string,
  ignoreLimit: boolean = false
): Promise<string[]> {
  const cachedFollowings = userCache.get(username)
  if (cachedFollowings) {
    if (cachedFollowings.length === 0) {
      console.debug(`${username} has no following users, skipping.`)
      return []
    }
    console.debug(
      `Get ${username}'s followings from cache: ${cachedFollowings.length}`
    )
    return cachedFollowings
  }

  const followings: string[] = []
  try {
    // 获取当前用户数据
    const _resp = await octokit.rest.users.getByUsername({ username })

    // 请求，但是更新ratelimit数据
    ratelimitData.limit = Number(_resp.headers["x-ratelimit-limit"])
    ratelimitData.remaining = Number(_resp.headers["x-ratelimit-remaining"])
    ratelimitData.reset = Number(_resp.headers["x-ratelimit-reset"])

    const userData = _resp.data

    // 跳过无关注或关注数过多的用户
    if (
      userData.following === 0 ||
      (userData.following >= maxFollowing.value && !ignoreLimit)
    ) {
      console.debug(
        `${username} has ${
          userData.following >= maxFollowing.value ? "too many" : "no"
        } following users, skipping.`
      )
      userCache.set(username, [])
      return []
    }

    // 分页获取关注列表
    const pagesMax = Math.ceil(userData.following / 100)

    for (let i = 1; i <= pagesMax; i++) {
      const followerData = (
        await octokit.rest.users.listFollowingForUser({
          username,
          per_page: 100,
          page: i,
        })
      ).data

      followings.push(
        ...followerData
          // 只保留用户
          .filter((user) => user.type == "User")
          .map((user) => {
            userIdCache.set(user.login, user.id)
            return user.login
          })
      )
      console.debug(`Getting ${username}'s followings: ${i}/${pagesMax} pages`)
    }
    userCache.set(username, followings)

    console.debug(
      `Get ${username}'s followings: ${userData.following} followings`
    )

    return followings
  } catch (error: any) {
    throw new Error(
      `Failed to fetch followings for ${username}: ${error.message}`
    )
  }
}

async function main() {
  octokit = new Octokit({ auth: ghToken.value })

  loading.value = true
  errorMessage.value = ""
  userGraph.clear()
  try {
    const mainFollowings = await getFollowings(mainUser.value, true)
    userGraph.nodes.set(mainUser.value, mainFollowings)

    for (let i = 0; i < mainFollowings.length; i++) {
      progressText.value[0] = `第 ${i + 1} / ${mainFollowings.length} 个用户`
      progressText.value[1] = `速率限制 ${ratelimitData.remaining}/${
        ratelimitData.limit
      } 将于 ${new Date(ratelimitData.reset * 1000).toLocaleTimeString()} 重置`

      const user = mainFollowings[i]
      const followings = await getFollowings(user)
      if (followings.length > 0) {
        userGraph.nodes.set(user, followings)
      }
    }
  } catch (error: any) {
    errorMessage.value = `获取主用户关注列表失败: ${error.message}`
  }

  loading.value = false
}
function clearCache() {
  userCache.clear()
  userIdCache.clear()
}
</script>
