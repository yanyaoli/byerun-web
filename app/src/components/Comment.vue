<template>
  <div ref="chatSectionRef"
    class="chat-section flex flex-col w-full relative overflow-hidden bg-white border border-black/8 rounded-xl mb-6 shadow-sm transition-all duration-300 transform-gpu h-[600px]">
    <div
      class="py-2.5 px-4 border-b border-zinc-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 grid place-items-center text-zinc-400">
          <i class="fa-solid fa-message text-xs"></i>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h3 class="text-sm font-bold text-zinc-800">留言板</h3>
            <button @click="showPrivacyInfo = true"
              class="text-zinc-300 hover:text-zinc-500 transition-all active:scale-90">
              <i class="fa-solid fa-circle-info text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button @click="refreshMessages" :disabled="loadingMessages" title="刷新"
          class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all active:rotate-180 duration-500">
          <i class="fa-solid fa-arrows-rotate text-xs" :class="{ 'animate-spin': loadingMessages }"></i>
        </button>
        <button @click="openSettings" title="个人设置"
          class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all">
          <i class="fa-solid fa-gear text-xs"></i>
        </button>
      </div>
    </div>

    <div v-if="!hasToken()" class="p-2 text-center text-[10px] bg-amber-50 text-amber-600 border-b border-amber-100">
      <i class="fa-solid fa-circle-info mr-1"></i> 请先登录
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4 relative bg-zinc-50/20" ref="messagesContainer">
      <!-- 消息列表 -->
      <template v-if="messages.length > 0 || !loadingMessages">
        <!-- 无痕分页加载哨兵 -->
        <div v-if="hasNext" ref="loadMoreSentinel" class="h-8 w-full flex justify-center items-center">
          <i v-if="loadingMore" class="fa-solid fa-circle-notch animate-spin text-zinc-300 text-xs"></i>
        </div>

        <div v-for="(m, i) in messages" :key="m.id" :id="'msg-' + m.id">
          <div v-if="shouldShowDate(i)" class="flex justify-center my-6">
            <span class="px-3 py-1 text-[10px] font-medium text-zinc-400 bg-zinc-200/40 rounded-full backdrop-blur-sm">
              {{ formatDateSeparator(m.created_at) }}
            </span>
          </div>

          <div class="relative group touch-pan-y" @touchstart.passive="handleTouchStart($event, m)"
            @touchmove.passive="handleTouchMove($event, m)" @touchend="handleTouchEnd(m)"
            @contextmenu.prevent="onMessageContext(m, $event)">

            <!-- Swipe Background Indicator -->
            <div v-if="swipeOffsets[m.id]"
              :class="['absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-200/50 flex items-center justify-center text-zinc-500 transition-all', isMe(m) ? 'left-2' : 'right-2']"
              :style="{ opacity: Math.min(Math.abs(swipeOffsets[m.id]) / 40, 1), transform: 'translateY(-50%) scale(' + Math.min(Math.abs(swipeOffsets[m.id]) / 50, 1.2) + ')' }">
              <i class="fa-solid fa-reply text-xs"></i>
            </div>

            <div
              :class="['flex items-end gap-2 mb-1 max-w-full transition-transform', isMe(m) ? 'flex-row-reverse' : 'flex-row']"
              :style="{ transform: 'translateX(' + (swipeOffsets[m.id] || 0) + 'px)', transition: isSwiping ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }">
              <div v-if="!isMe(m)" class="flex-shrink-0 mb-0.5 relative" @click="openUserProfile(m.user)">
                <div
                  class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm cursor-pointer relative">
                  <!-- Avatar Skeleton background -->
                  <div class="absolute inset-0 bg-zinc-100 animate-pulse"></div>
                  <img v-if="m.user?.avatar_url" :src="normalizeAvatarUrl(m.user.avatar_url)"
                    referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-cover rounded-full z-10" />
                  <i v-else class="fa-solid fa-user text-zinc-400 text-[10px] z-10"></i>
                </div>
                <!-- 优化后的校徽/认证标识：使用 SVG 替代字体图标，并使用 Flex 居中，确保在任何缩放级别下都不会错位 -->
                <div v-if="m.user?.is_alumni"
                  class="absolute -bottom-0.5 right-0 translate-x-1/4 translate-y-1/4 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center z-20 shadow-sm overflow-hidden"
                  title="认证校友">
                  <svg viewBox="0 0 24 24" class="w-[70%] h-[70%] text-white fill-current">
                    <path d="M12 3L1 9l11 6l9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </div>
              </div>

              <div :class="['flex flex-col max-w-[85%] relative', isMe(m) ? 'items-end' : 'items-start']">
                <div class="flex items-end gap-1 relative" :class="isMe(m) ? 'flex-row' : 'flex-row-reverse'">
                  <!-- Reply Icon (Outside) -->
                  <button @click.stop="startReply(m)"
                    class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-zinc-300 hover:text-zinc-600 transition-colors active:scale-90 mb-0.5">
                    <i class="fa-solid fa-reply text-[9px]"></i>
                  </button>

                  <!-- Bubble -->
                  <div :class="[
                    'relative px-3 py-1.5 shadow-sm transition-all select-none cursor-default message-bubble-target',
                    isMe(m) ? 'bg-[#effdde] text-zinc-800 rounded-2xl rounded-br-[0.25rem]' : 'bg-white text-zinc-900 border border-zinc-200 rounded-2xl rounded-bl-[0.25rem]'
                  ]">

                    <div v-if="!isMe(m)" class="text-[11px] text-zinc-500 mb-0.5 font-bold">{{ m.user?.nickname || '用户'
                    }}</div>

                    <div v-if="m.reply?.content"
                      class="mb-1 p-2 bg-black/5 rounded-lg border-l-2 border-zinc-400/50 text-[11px] text-zinc-500 cursor-pointer"
                      @click="scrollToOriginalMessage(m.reply)">
                      <div class="truncate opacity-80" v-html="renderContent(m.reply.content)"></div>
                    </div>

                    <div class="whitespace-pre-wrap break-all leading-relaxed text-[13.5px]"
                      v-html="renderContent(m.content)"></div>

                    <div class="text-[9px] mt-0.5 text-zinc-400/60 text-right">{{ formatTime(m.created_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 骨架屏效果 (仅在初始加载且没有消息时显示) -->
      <div v-if="loadingMessages && messages.length === 0" class="space-y-6">
        <div v-for="n in 6" :key="n"
          :class="['flex items-end gap-2 animate-pulse', n % 3 === 0 ? 'flex-row-reverse' : 'flex-row']">
          <!-- 只有他人消息显示头像骨架 -->
          <div v-if="n % 3 !== 0" class="w-8 h-8 rounded-full bg-zinc-200/60 flex-shrink-0"></div>
          <div :class="['flex flex-col space-y-2', n % 3 === 0 ? 'items-end' : 'items-start']">
            <div class="w-16 h-2 bg-zinc-200/40 rounded"></div>
            <div class="px-3 py-1.5 bg-zinc-200/30 rounded-2xl min-h-[40px]"
              :style="{ width: (Math.random() * 100 + 100) + 'px' }">
              <div class="w-full h-2 bg-zinc-200/20 rounded mb-2"></div>
              <div class="w-2/3 h-2 bg-zinc-200/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-3 bg-white border-t border-zinc-100 relative">
      <!-- 回复预览 (仅当 replyingTo.content 存在时显示) -->
      <div v-if="replyingTo?.content"
        class="mx-1 mb-3 px-3 py-2 bg-zinc-50 rounded-2xl flex items-center justify-between border border-zinc-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="flex-1 min-w-0 pr-2">
          <div class="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
            正在回复 {{ replyingTo.user?.nickname || '用户' }}
          </div>
          <div class="text-xs text-zinc-500 truncate opacity-80" v-html="renderContent(replyingTo.content)"></div>
        </div>
        <button @click="cancelReply"
          class="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-zinc-500 active:scale-90 transition-all">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <div v-if="showEmojiPicker"
        class="absolute bottom-full left-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-zinc-100 z-50 rounded-t-[2rem] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
        <div class="flex items-center justify-between mb-4 px-1">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Twemoji</span>
          <button @click="showEmojiPicker = false"
            class="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-zinc-500">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="space-y-6 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
          <div v-for="(group, name) in emojiGroups" :key="name">
            <div class="text-[9px] font-bold uppercase tracking-widest text-zinc-300 mb-3 ml-1">{{ name }}</div>
            <div class="grid grid-cols-7 sm:grid-cols-8 gap-2">
              <button v-for="emoji in group" :key="emoji.code" @click="addEmoji(emoji.char)"
                class="aspect-square grid place-items-center hover:bg-zinc-100 rounded-xl transition-all active:scale-95 group">
                <img :src="getEmojiUrl(emoji.code)" class="w-7 h-7 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-end gap-2 max-w-5xl mx-auto">
        <div
          class="flex-1 flex items-end gap-1 bg-zinc-100/70 rounded-[22px] px-2 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-200 transition-all shadow-inner">
          <button @click="showEmojiPicker = !showEmojiPicker"
            class="w-9 h-9 flex-shrink-0 grid place-items-center text-zinc-400 hover:text-zinc-600 transition-colors">
            <i class="fa-regular fa-face-smile text-xl"></i>
          </button>

          <textarea ref="messageInput" v-model="text" placeholder="说点什么吧" rows="1" @input="adjustTextareaHeight"
            @keydown.enter.exact.prevent="send" :disabled="!hasToken()"
            class="flex-1 bg-transparent border-none outline-none text-sm py-2 px-1 resize-none max-h-32 min-h-[36px] leading-relaxed"></textarea>

          <button v-if="text" @click="clearText"
            class="w-9 h-9 flex-shrink-0 grid place-items-center text-zinc-300 hover:text-rose-400 transition-colors">
            <i class="fa-solid fa-circle-xmark text-lg"></i>
          </button>
        </div>

        <button @click="send" :disabled="!hasToken() || !text.trim() || isSending"
          class="w-10 h-10 flex-shrink-0 grid place-items-center bg-zinc-900 text-white rounded-full active:scale-90 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50 disabled:shadow-none mb-0.5">
          <i v-if="isSending" class="fa-solid fa-circle-notch animate-spin text-sm"></i>
          <i v-else class="fa-solid fa-paper-plane text-sm"></i>
        </button>
      </div>
    </div>

    <div v-if="showSettings"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
      <div class="bg-white w-full max-w-[280px] rounded-[2rem] shadow-2xl border border-zinc-100 overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col items-center mb-6">
            <div
              class="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border-2 border-zinc-50 shadow-inner mb-2 relative">
              <div v-if="loadingUserSettings" class="absolute inset-0 bg-zinc-100 animate-pulse z-10"></div>
              <template v-if="user?.avatar_url">
                <img :src="normalizeAvatarUrl(user.avatar_url)" class="w-full h-full object-cover" />
              </template>
              <i v-else class="fa-solid fa-user text-zinc-300 text-2xl"></i>
            </div>
            <h3 class="text-base font-bold text-zinc-900">个人设置</h3>
            <p class="text-[10px] text-zinc-400">修改昵称和同步 QQ 头像</p>
          </div>
          <div class="space-y-4">
            <div class="space-y-1">
              <label class="text-[9px] font-bold uppercase text-zinc-400 ml-1">昵称</label>
              <div v-if="loadingUserSettings" class="h-9 w-full bg-zinc-50 animate-pulse rounded-xl"></div>
              <input v-else v-model="settingsNickname"
                class="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-100 transition-all" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold uppercase text-zinc-400 ml-1">QQ 号 (同步头像)</label>
              <div v-if="loadingUserSettings" class="h-9 w-full bg-zinc-50 animate-pulse rounded-xl"></div>
              <input v-else v-model="settingsQQ"
                class="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-100 transition-all" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-8">
            <button @click="applySettings" :disabled="isSavingSettings"
              class="py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <i v-if="isSavingSettings" class="fa-solid fa-circle-notch animate-spin"></i>
              {{ isSavingSettings ? '正在保存' : '保存' }}
            </button>
            <button @click="showSettings = false" :disabled="isSavingSettings"
              class="py-2 bg-zinc-100 text-zinc-500 rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50">取消</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showProfileViewer"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm"
      @click.self="showProfileViewer = false">
      <div
        class="bg-white w-full max-w-[300px] rounded-[1.5rem] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <!-- 关闭按钮 -->
        <button @click="showProfileViewer = false"
          class="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-600 active:scale-90 transition-all z-10">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>

        <div class="p-6">
          <div class="flex items-center gap-4">
            <!-- 头像区域 -->
            <div class="flex-shrink-0">
              <div
                class="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                <template v-if="viewedProfile?.avatar_url">
                  <img :src="normalizeAvatarUrl(viewedProfile.avatar_url)" referrerpolicy="no-referrer"
                    class="w-full h-full object-cover" />
                </template>
                <i v-else class="fa-solid fa-user text-zinc-300 text-2xl"></i>
              </div>
            </div>

            <!-- 资料信息 -->
            <div class="flex-1 min-w-0">
              <h3 v-if="loadingProfile && !viewedProfile?.nickname"
                class="h-5 w-24 bg-zinc-100 animate-pulse rounded mb-1">
              </h3>
              <h3 v-else class="text-base font-bold text-zinc-900 truncate mb-0.5 whitespace-nowrap">
                {{ viewedProfile?.nickname || '用户' }}
              </h3>

              <p v-if="loadingProfile" class="h-3 w-32 bg-zinc-50 animate-pulse rounded mb-1.5"></p>
              <p v-else class="text-[10px] text-zinc-400 mb-1.5">{{ formatLastSeen(viewedProfile?.last_seen_at) }}</p>

              <!-- 校友身份提示 -->
              <div v-if="viewedProfile?.is_alumni"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold">
                <i class="fa-solid fa-graduation-cap"></i>
                TA是你的校友
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐私说明弹窗 -->
    <div v-if="showPrivacyInfo"
      class="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-sm"
      @click.self="showPrivacyInfo = false">
      <div
        class="bg-white w-full max-w-[300px] rounded-[1.5rem] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="p-6">
          <div class="flex items-center gap-2 mb-4 text-zinc-800">
            <i class="fa-solid fa-shield-halved text-blue-500"></i>
            <h3 class="font-bold text-sm">隐私与校友功能说明</h3>
          </div>
          <div class="space-y-3">
            <p class="text-[12px] text-zinc-600 leading-relaxed">
              为了在留言板中实现在校校友身份识别，我们需要对您 UNIRUN 授权数据中的学校信息进行提取与比对。
            </p>
            <p class="text-[12px] text-zinc-600 leading-relaxed">
              <strong>使用留言功能即视为您已知晓并同意我们基于学校标识字段进行校友匹配分析。</strong>
            </p>
          </div>
          <button @click="showPrivacyInfo = false"
            class="mt-6 w-full py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all">
            我知道了
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="contextMenu.show" class="fixed inset-0 z-[1100]" @click="closeMenu" @contextmenu.prevent="closeMenu"
        @scroll.prevent>
        <div
          class="absolute bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-2xl p-1.5 min-w-[140px] shadow-zinc-300/50"
          :class="[contextMenu.direction === 'down' ? 'menu-pop-animation origin-top' : 'menu-pop-animation-up origin-bottom']"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
          <button v-if="isMe(contextMenu.message)" @click="deleteMessage(contextMenu.message.id); closeMenu()"
            :disabled="isDeleting"
            class="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors disabled:opacity-50">
            <i v-if="isDeleting" class="fa-solid fa-circle-notch animate-spin"></i>
            <i v-else class="fa-solid fa-trash-can"></i>
            {{ isDeleting ? '正在删除...' : '删除消息' }}
          </button>
          <button @click="startReply(contextMenu.message); closeMenu()"
            class="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-100 rounded-xl transition-colors">
            <i class="fa-solid fa-reply text-zinc-400"></i>
            回复
          </button>
        </div>
      </div>
    </Teleport>

    <Message ref="messageRef" />
    <ConfirmDialog ref="confirmRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, reactive, watch, inject } from 'vue';
import MessageClient from '@/composables/messageClient';
import Message from '@/components/Message.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import emojiGroups from '@/assets/emoji/emojiGroups.json';
import { decrypt } from '@/utils/crypto';

// 注入全局消息方法
const showMessage = inject('showMessage');
const setLayoutHidden = inject('setLayoutHidden', () => { });

const API_BASE = (import.meta.env.VITE_CHAT_SERVER_BASE_URL || '').replace(/\/$/, '');
const client = new MessageClient({ baseUrl: API_BASE });

// 头像地址处理：如果是相对路径则拼接后端域名
function normalizeAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return API_BASE + (url.startsWith('/') ? '' : '/') + url;
}

const messages = ref([]);
const loadingMessages = ref(true);
const loadingMore = ref(false);
const isSending = ref(false);
const isSavingSettings = ref(false);
const isDeleting = ref(false);
const currentPage = ref(1);
const hasNext = ref(false);
const user = ref(null);
const viewedProfile = ref(null);
const loadingProfile = ref(false); // 新增资料加载状态
const loadingUserSettings = ref(false); // 新增设置加载状态
const showProfileViewer = ref(false);
const showPrivacyInfo = ref(false); // 新增隐私说明状态
const text = ref('');
const replyingTo = ref(null);
const showEmojiPicker = ref(false);
const showSettings = ref(false);
const settingsNickname = ref('');
const settingsQQ = ref('');
const swipeOffsets = reactive({});
const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  message: null,
  direction: 'down'
});

const messagesContainer = ref(null);
const loadMoreSentinel = ref(null);
const messageInput = ref(null);
const messageRef = ref(null);
const confirmRef = ref(null);
const chatSectionRef = ref(null);

let scrollObserver = null;

const setupIntersectionObserver = () => {
  if (scrollObserver) scrollObserver.disconnect();

  scrollObserver = new IntersectionObserver((entries) => {
    // 当哨兵进入视野，且不仅是在初始化加载，且有更多数据时触发
    if (entries[0].isIntersecting && hasNext.value && !loadingMore.value && !loadingMessages.value) {
      loadMore();
    }
  }, {
    root: messagesContainer.value,
    threshold: 0.1,
    rootMargin: '100px 0px 0px 0px' // 提前 100px 开始加载，更加无痕
  });

  if (loadMoreSentinel.value) {
    scrollObserver.observe(loadMoreSentinel.value);
  }
};

// 监听哨兵元素的变化（由 v-if 控制）
watch(loadMoreSentinel, (el) => {
  if (el && !scrollObserver) {
    setupIntersectionObserver();
  } else if (el && scrollObserver) {
    scrollObserver.observe(el);
  }
});

// 监听加载状态，完成后强制定位到底部
watch(loadingMessages, (isLoading) => {
  if (!isLoading) {
    nextTick(() => {
      scrollToBottom(false);
    });
  }
});

// 监听消息列表变化，自动滚动到底部
watch(messages, (newVal, oldVal) => {
  // 如果是获取新消息（不是加载历史记录），则滚动到底部
  if (!loadingMore.value) {
    nextTick(() => {
      // 如果是第一次加载或者新消息进来，滚动到底部
      scrollToBottom(oldVal.length > 0);
    });
  }
}, { deep: false });


// 辅助函数：从加密存储获取原生数据
const getNativeData = () => {
  const encrypted = localStorage.getItem('unirun_data');
  return decrypt(encrypted) || {};
};

const getToken = () => {
  const data = getNativeData();
  return data.userInfo?.oauthToken?.token || localStorage.getItem('unirun_token') || '';
};

const hasToken = () => !!getToken();

const isMe = (m) => {
  // 1. 优先从响应式 user 获取
  if (user.value?.user_id && m.user?.user_id) {
    return String(user.value.user_id) === String(m.user.user_id);
  }
  // 2. 其次从同步的 localStorage 获取，支持多种可能的 key
  const data = getNativeData();
  let cachedId = data.userInfo?.userId || localStorage.getItem('unorun_chat_userId');

  if (!cachedId) {
    try {
      const userData = JSON.parse(localStorage.getItem('unorun_chat_userData') || '{}');
      cachedId = userData.user_id;
    } catch (e) {
      cachedId = null;
    }
  }

  if (cachedId && m.user?.user_id) {
    return String(cachedId) === String(m.user.user_id);
  }
  return false;
};
const showToast = (msg, type = 'info') => {
  if (showMessage) showMessage(msg, type);
  else messageRef.value?.show?.(msg, type);
};

function handleApiError(e, defaultMsg) {
  console.error(defaultMsg || 'API Error', e);
  if (e && (e.code === 'unauthorized' || /unauthor/i.test(String(e.message || '')))) {
    client.setToken(null);
    user.value = null;
    loadingMessages.value = false;
    showToast('请先登录', 'warning');
    return;
  }
  showToast(defaultMsg || '请求失败', 'error');
}

// --- 业务功能 ---

async function fetchUser() {
  try {
    const data = await client.getProfile();
    user.value = data.user;
    if (data.user?.user_id) {
      // 存储到 localStorage，确保下次进入或刷新时能立即通过 isMe 判断身份
      localStorage.setItem('unorun_chat_userId', data.user.user_id);
      localStorage.setItem('unorun_chat_userData', JSON.stringify(data.user));
    }
  } catch (e) { handleApiError(e, '获取用户信息失败'); }
}

async function fetchMessages(isSilent = false) {
  if (!isSilent) loadingMessages.value = true;
  try {
    const size = 50;
    const data = await client.listMessages(1, size);
    const msgs = data.messages || [];
    // 如果服务器返回的是最新在前（倒序），则把它转成正序（旧->新）
    if (msgs.length > 1) {
      const first = new Date(msgs[0].created_at);
      const last = new Date(msgs[msgs.length - 1].created_at);
      if (first > last) msgs.reverse();
    }
    messages.value = [...msgs];
    // 使用后端返回的 hasNext 字段；没有时用返回条数来做保守判断
    hasNext.value = data.hasNext ?? (msgs.length === size);
    currentPage.value = 1;

    // 先隐藏加载状态，确保 DOM 节点生成
    loadingMessages.value = false;
    await nextTick();
    scrollToBottom(false);
  } catch (e) {
    handleApiError(e, '消息加载失败');
    loadingMessages.value = false;
  }
}

async function refreshMessages() {
  if (loadingMessages.value) return;
  await fetchMessages();
}

async function loadMore() {
  if (loadingMore.value || !hasNext.value) return;
  loadingMore.value = true;
  try {
    const lastScrollHeight = messagesContainer.value?.scrollHeight || 0;
    const nextPage = currentPage.value + 1;
    const size = 50;
    const data = await client.listMessages(nextPage, size);
    let nextMsgs = data.messages || [];
    if (nextMsgs.length > 1) {
      const first = new Date(nextMsgs[0].created_at);
      const last = new Date(nextMsgs[nextMsgs.length - 1].created_at);
      if (first > last) nextMsgs.reverse();
    }
    messages.value = [...nextMsgs, ...messages.value];
    hasNext.value = data.hasNext ?? (nextMsgs.length === size);
    currentPage.value = nextPage;
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - lastScrollHeight;
    }
  } catch (e) {
    handleApiError(e, '历史记录加载失败');
  } finally {
    loadingMore.value = false;
  }
}

function adjustTextareaHeight() {
  const el = messageInput.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function clearText() {
  text.value = '';
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto';
    }
  });
}

async function send() {
  if (!text.value.trim() || isSending.value) return;
  isSending.value = true;
  try {
    const data = await client.sendMessage(text.value, replyingTo.value?.id);
    // 检查是否已被 WS 提前添加
    const messageId = data.message?.id;
    if (messageId && !messages.value.some(m => String(m.id) === String(messageId))) {
      const newMessage = {
        ...data.message,
        user: { ...user.value } // 直接同步当前用户信息
      };
      messages.value.push(newMessage);
    }
    clearText();
    cancelReply();
    await nextTick();
    scrollToBottom();
  } catch (e) { handleApiError(e, '发送失败'); }
  finally { isSending.value = false; }
}

function startReply(m) {
  // 只有当目标消息有内容时才允许回复
  if (!m?.content) {
    showToast('该消息不可回复', 'info');
    return;
  }
  replyingTo.value = m;
  nextTick(() => {
    messageInput.value?.focus();
  });
}

function cancelReply() {
  replyingTo.value = null;
}

function scrollToOriginalMessage(reply) {
  if (!reply) return;

  // 若 reply 没有 content，认为无法定位
  if (!reply.content) {
    showToast('原消息内容不可用', 'info');
    return;
  }

  const targetId = reply.id;
  const element = document.getElementById(`msg-${targetId}`);

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 添加高亮效果
    element.classList.add('message-highlight');
    setTimeout(() => {
      element.classList.remove('message-highlight');
    }, 2000);
  } else {
    // 如果 DOM 中不存在，检查是否在当前数组中但尚未渲染（通常不会发生，但为了严谨）
    const existsInList = messages.value.some(m => m.id === targetId);
    if (existsInList) {
      showToast('正在定位...', 'info');
    } else {
      showToast('该消息已被删除', 'info');
    }
  }
}

async function deleteMessage(id) {
  const ok = await confirmRef.value.show({ title: '确认删除', message: '确认删除该消息？' });
  if (!ok) return;
  isDeleting.value = true;
  try {
    await client.deleteMessage(id);
    messages.value = messages.value.filter(m => m.id !== id);
    showToast('删除成功', 'success');
  } catch (e) { showToast('删除失败', 'error'); }
  finally { isDeleting.value = false; }
}

async function applySettings() {
  if (isSavingSettings.value) return;
  isSavingSettings.value = true;
  try {
    const data = await client.updateUser({
      nickname: settingsNickname.value.trim(),
      qq: settingsQQ.value.trim()
    });

    // 更新当前用户状态
    user.value = data.user;
    // 同步更新缓存
    localStorage.setItem('unorun_chat_userData', JSON.stringify(data.user));

    showSettings.value = false;
    showToast('设置已更新', 'success');
  } catch (e) {
    showToast('保存失败', 'error');
  } finally {
    isSavingSettings.value = false;
  }
}

async function openSettings() {
  showSettings.value = true;
  loadingUserSettings.value = true;
  try {
    const data = await client.getProfile();
    user.value = data.user;
    settingsNickname.value = user.value?.nickname || '';
    settingsQQ.value = user.value?.qq || '';
    // 同步更新缓存，保证下次进入页面时 isMe 判定准确
    localStorage.setItem('unorun_chat_userData', JSON.stringify(data.user));
    localStorage.setItem('unorun_chat_userId', data.user.user_id);
  } catch (e) {
    handleApiError(e, '获取用户信息失败');
  } finally {
    loadingUserSettings.value = false;
  }
}

// --- 渲染逻辑 ---

function closeMenu() {
  contextMenu.show = false;
}

function showMenu(m, targetEl) {
  contextMenu.show = true;
  contextMenu.message = m;

  // 使用 nextTick 确保菜单 DOM 已渲染（如果之前是隐藏的）并可以计算高度，但这里我们先计算位置
  const rect = targetEl.getBoundingClientRect();
  const menuWidth = 140;
  const isMyMsg = isMe(m);
  const menuHeight = isMyMsg ? 110 : 60; // 动态估计高度

  // 计算水平位置：尽量对齐气泡中心
  let left = rect.left + (rect.width / 2) - (menuWidth / 2);
  // 边缘修正：确保不超出屏幕左右
  left = Math.max(15, Math.min(left, window.innerWidth - menuWidth - 15));

  // 计算垂直位置：优先在下方
  let top = rect.bottom + 10;
  let direction = 'down';

  // 空间检查：如果下方位置不够，则弹在上方
  if (top + menuHeight > window.innerHeight - 20) {
    top = rect.top - menuHeight - 10;
    direction = 'up';
  }

  contextMenu.x = left;
  contextMenu.y = top;
  contextMenu.direction = direction;

  if (navigator.vibrate) navigator.vibrate(40);
}

function getEmojiUrl(code) {
  if (!code) return null;
  const parts = code.split('-').map(p => p.replace(/fe0f$/i, '').toLowerCase()).filter(Boolean);
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${parts.join('-')}.svg`;
}


function renderContent(content) {
  if (!content) return '';
  const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
  return content.replace(emojiRegex, (match) => {
    let codePoints = Array.from(match).map(c => c.codePointAt(0).toString(16)).join('-');
    codePoints = codePoints.replace(/-fe0f/g, '');
    return `<img src="${getEmojiUrl(codePoints)}" class="inline-block w-[1.2em] h-[1.2em] mx-0.5 align-text-bottom" />`;
  });
}

function addEmoji(char) {
  text.value += char;
  nextTick(() => {
    adjustTextareaHeight();
  });
}
function formatTime(s) { const d = new Date(s); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
function formatLastSeen(s) {
  if (!s) return '离线';
  const date = new Date(s);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return '刚刚在线';
  if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前在线';
  if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前在线';
  if (diff < 2592000) return Math.floor(diff / 86400) + ' 天前在线';
  return date.toLocaleDateString() + ' 在线';
}
function formatDateSeparator(s) { return new Date(s).toLocaleDateString(); }
function shouldShowDate(index) {
  if (index === 0) return true;
  return new Date(messages.value[index].created_at).toDateString() !== new Date(messages.value[index - 1].created_at).toDateString();
}
function scrollToBottom(smooth = true) {
  if (messagesContainer.value) {
    const target = messagesContainer.value;
    const scroll = () => {
      target.scrollTo({
        top: target.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    };
    scroll();
    // 双重保险：在 DOM 完全稳定后再执行一次，处理表情包加载或布局计算延迟
    setTimeout(scroll, 60);
  }
}

// --- 交互控制 ---
let longPressTimer = null;
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = ref(false);

const handleTouchStart = (e, m) => {
  // 保存触发元素，用于定位菜单
  const target = e.currentTarget;

  // 长按菜单
  longPressTimer = setTimeout(() => {
    // 寻找气泡主体进行定位
    const bubble = target.querySelector('.message-bubble-target');
    showMenu(m, bubble || target);
    swipeOffsets[m.id] = 0;
  }, 650);

  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

function handleTouchMove(e, m) {
  const deltaX = e.touches[0].clientX - touchStartX;
  const deltaY = e.touches[0].clientY - touchStartY;

  // 如果垂直移动大于水平移动，不判定为滑动
  if (Math.abs(deltaY) > Math.abs(deltaX)) return;

  // 移动端逻辑：
  // 他人消息：左滑回复 (deltaX < 0)
  // 个人消息：右滑回复 (deltaX > 0)
  if (!isMe(m) && deltaX < -5) {
    clearTimeout(longPressTimer);
    isSwiping.value = true;
    swipeOffsets[m.id] = Math.max(deltaX * 0.6, -80);
  } else if (isMe(m) && deltaX > 5) {
    clearTimeout(longPressTimer);
    isSwiping.value = true;
    swipeOffsets[m.id] = Math.min(deltaX * 0.6, 80);
  }
}

function handleTouchEnd(m) {
  clearTimeout(longPressTimer);
  const offset = swipeOffsets[m.id] || 0;

  // 触发阈值判定
  if (!isMe(m) && offset < -50) {
    startReply(m);
  } else if (isMe(m) && offset > 50) {
    startReply(m);
  }

  // 自动回位
  swipeOffsets[m.id] = 0;
  setTimeout(() => {
    isSwiping.value = false;
  }, 100);
}

function onMessageContext(m, e) {
  e.preventDefault();
  const bubble = e.currentTarget.querySelector('.message-bubble-target');
  showMenu(m, bubble || e.currentTarget);
}

async function openUserProfile(u) {
  if (!u) return;
  const uid = String(u.user_id);

  if (uid === String(user.value?.user_id)) {
    openSettings();
    return;
  }

  viewedProfile.value = { ...u };
  showProfileViewer.value = true;
  loadingProfile.value = true; // 开始加载详细资料

  try {
    // 确保调用时能拿到最新的 qq 进而代理出头像
    const data = await client.getUserInfo(uid);
    if (data?.user) {
      viewedProfile.value = data.user;
    }
  } catch (e) {
    handleApiError(e, '获取资料失败');
  } finally {
    loadingProfile.value = false;
  }
}

// 定义 Socket 监听回调，方便卸载
const onMessage = (msg) => {
  if (msg?.id && !messages.value.some(m => String(m.id) === String(msg.id))) {
    messages.value.push(msg);
    nextTick(() => scrollToBottom());
  }
};

const onDelete = ({ id }) => {
  messages.value = messages.value.filter(m => String(m.id) !== String(id));
};

onMounted(async () => {
  // 立即尝试从本地缓存恢复用户基础信息，防止消息列表渲染时出现布局跳变（我的消息显示在左侧）
  const cachedUser = localStorage.getItem('unorun_chat_userData');
  if (cachedUser) {
    try {
      const parsed = JSON.parse(cachedUser);
      if (parsed) user.value = parsed;
    } catch (e) {
      console.error('Failed to parse cached userData', e);
    }
  }

  // 初始化 Socket 监听
  client.on('message', onMessage);
  client.on('delete', onDelete);

  if (hasToken()) {
    client.setToken(getToken());
    client.connectSocket(); // 连接 WebSocket
    loadingMessages.value = true;
    try {
      // 改为串行加载：先确保拿到用户信息，再拉取消息列表
      // 这样 fetchMessages 渲染时 isMe 判断会绝对准确，杜绝布局重排产生的闪烁
      await fetchUser();
      await fetchMessages(true);
    } catch (e) {
      handleApiError(e);
    } finally {
      loadingMessages.value = false;
    }
  } else {
    // 未登录时，尝试获取消息（通常是公开内容，但 fetchMessages 可能需要 token，取决于后端实现）
    client.connectSocket();
    fetchMessages().finally(() => {
      loadingMessages.value = false;
    });
  }
});

onUnmounted(() => {
  if (scrollObserver) {
    scrollObserver.disconnect();
    scrollObserver = null;
  }
  // 移除监听器
  client.off('message', onMessage);
  client.off('delete', onDelete);
  client.disconnectSocket(); // 断开 WebSocket
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e4e4e7;
  border-radius: 10px;
}

@keyframes highlight-fade {
  0% {
    background-color: transparent;
  }

  20% {
    background-color: rgba(254, 243, 199, 0.6);
  }

  100% {
    background-color: transparent;
  }
}

.message-highlight {
  animation: highlight-fade 2s ease-in-out;
  border-radius: 1rem;
}
</style>