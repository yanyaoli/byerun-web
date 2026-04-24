<template>
  <div class="w-full h-full min-h-0 mx-auto overflow-x-hidden">
    <div
      class="chat-section h-full min-h-0 flex flex-col w-full max-w-full relative overflow-hidden bg-transparent transition-all duration-300"
    >
      <AppHeader ref="appHeaderRef" :show-github="false">
        <template #content>
          <div class="flex items-center w-full h-full px-2">
            <div class="flex items-center gap-2 min-w-0 pointer-events-auto">
              <button
                @click="onBack"
                title="返回"
                class="w-7 h-7 flex items-center justify-center chat-nav-action rounded-full transition-all"
              >
                <i class="ri-arrow-left-line text-sm"></i>
              </button>
              <div class="flex items-center min-w-0">
                <div class="text-[14px] font-semibold theme-text-primary truncate">消息</div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 pointer-events-auto ml-auto">
              <button
                @click="showPrivacyInfo = true"
                title="Usage Notes"
                class="w-7 h-7 flex items-center justify-center chat-nav-action rounded-full transition-all"
              >
                <i class="ri-information-line text-sm"></i>
              </button>
            </div>
          </div>
        </template>
      </AppHeader>

      <!-- 登录提示 -->
      <div
        v-if="!hasToken()"
        class="absolute top-[52px] left-1/2 -translate-x-1/2 z-[999] px-3 py-1 text-center text-[10px] bg-amber-50/95 text-amber-600 rounded-full backdrop-blur-sm"
      >
        <i class="ri-information-line mr-1"></i> 请先登录
      </div>

      <!-- 消息容器 -->
      <div
        ref="messagesContainer"
        class="flex-1 max-w-full overflow-y-auto overflow-x-hidden overscroll-y-none px-4 space-y-4 relative"
        :style="{
          paddingTop: `${messageListPaddingTop}px`,
          paddingBottom: `${messageBottomInset}px`,
        }"
      >
        <!-- 消息列表 -->
        <template v-if="messages.length > 0 || !loadingMessages">
          <!-- 无痕分页加载哨兵 -->
          <div
            v-if="hasNext"
            ref="loadMoreSentinel"
            class="h-8 w-full flex justify-center items-center"
          >
            <i
              v-if="loadingMore"
              class="ri-loader-4-line animate-spin theme-text-secondary text-xs"
            ></i>
          </div>

          <div v-for="(m, i) in messages" :key="m.id" :id="'msg-' + m.id">
            <!-- 时间分割 -->
            <div v-if="shouldShowDate(i)" class="flex justify-center my-6">
              <span
                class="px-3 py-1 text-[10px] font-medium theme-text-secondary theme-card-soft rounded-full"
              >
                {{ formatDateSeparator(m.created_at) }}
              </span>
            </div>

            <div
              class="relative group touch-pan-y"
              @touchstart.passive="handleTouchStart($event, m)"
              @touchmove.passive="handleTouchMove($event, m)"
              @touchend="handleTouchEnd(m)"
              @contextmenu.prevent="onMessageContext(m, $event)"
            >
              <div
                v-if="swipeOffsets[m.id]"
                :class="[
                  'absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all chat-swipe-indicator',
                  isMe(m) ? 'left-2' : 'right-2',
                ]"
                :style="{
                  opacity: Math.min(Math.abs(swipeOffsets[m.id]) / 40, 1),
                  transform:
                    'translateY(-50%) scale(' +
                    Math.min(Math.abs(swipeOffsets[m.id]) / 50, 1.2) +
                    ')',
                }"
              >
                <i class="ri-reply-fill text-xs"></i>
              </div>

              <div
                :class="[
                  'flex items-end gap-2 mb-1 w-full transition-transform theme-text-primary',
                  isMe(m) ? 'flex-row-reverse' : 'flex-row',
                ]"
                :style="{
                  transform: 'translateX(' + (swipeOffsets[m.id] || 0) + 'px)',
                  transition: isSwiping
                    ? 'none'
                    : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }"
              >
                <div
                  v-if="!isMe(m)"
                  class="flex-shrink-0 mb-0.5 relative"
                  @click="openUserProfile(m.user)"
                >
                  <div
                    class="w-8 h-8 rounded-full theme-card-soft flex items-center justify-center overflow-hidden shadow-sm cursor-pointer relative"
                  >
                    <div class="absolute inset-0 theme-card-soft animate-pulse"></div>
                    <img
                      v-if="m.user?.avatar_url"
                      :src="normalizeAvatarUrl(m.user.avatar_url)"
                      referrerpolicy="no-referrer"
                      loading="lazy"
                      class="w-full h-full object-cover rounded-full z-10 avatar-fade-in"
                    />
                    <i v-else class="ri-user-3-fill theme-text-secondary text-[10px] z-10"></i>
                  </div>
                  <div
                    v-if="m.user?.is_alumni"
                    class="absolute -bottom-0.5 right-0 translate-x-1/4 translate-y-1/4 w-3.5 h-3.5 chat-alumni-badge rounded-full flex items-center justify-center z-20 shadow-sm overflow-hidden"
                    title="认证校友"
                  >
                    <i class="ri-graduation-cap-fill text-white text-[7px]"></i>
                  </div>
                </div>

                <div
                  :class="[
                    'flex flex-col min-w-0 relative flex-1',
                    isMe(m) ? 'items-end' : 'items-start',
                  ]"
                >
                  <div
                    class="flex items-end gap-1 max-w-[92%] relative"
                    :class="isMe(m) ? 'flex-row' : 'flex-row-reverse'"
                  >
                    <button
                      @click.stop="onMessageActionClick(m)"
                      class="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors active:scale-90 mb-0.5"
                    >
                      <template v-if="isMe(m) && m.__status === 'sending'">
                        <i
                          class="ri-loader-4-line animate-spin text-[9px] theme-text-secondary"
                        ></i>
                      </template>
                      <template v-else-if="isMe(m) && m.__status === 'failed'">
                        <i class="fa-solid fa-rotate-right text-[9px] text-rose-500"></i>
                      </template>
                      <template v-else>
                        <i class="ri-reply-fill text-[9px] chat-reply-trigger"></i>
                      </template>
                    </button>

                    <div
                      :class="[
                        'relative px-3 py-1.5 theme-text-primary rounded-xl rounded-br-[0.25rem] shadow-sm transition-all select-none cursor-default message-bubble-target min-w-0 break-words',
                        isMe(m) ? 'chat-bubble-me' : 'chat-bubble-peer',
                      ]"
                    >
                      <div
                        v-if="!isMe(m)"
                        class="text-[11px] theme-text-secondary mb-0.5 font-bold"
                      >
                        {{
                          m.user?.nickname ||
                          m.nickname ||
                          '用户' + String(m.user?.user_id).slice(-5)
                        }}
                      </div>

                      <div
                        v-if="m.reply?.content"
                        :class="[
                          'mb-1 p-2 text-[11px] cursor-pointer overflow-hidden chat-reply-quote',
                          isMe(m) ? 'chat-reply-quote--me' : 'chat-reply-quote--peer',
                        ]"
                        @click="scrollToOriginalMessage(m.reply)"
                      >
                        <div class="text-[10px] font-bold mb-0.5 opacity-60">
                          {{
                            m.reply.user?.nickname ||
                            (m.reply.user?.user_id
                              ? '用户' + String(m.reply.user.user_id).slice(-5)
                              : '用户')
                          }}
                        </div>
                        <div
                          class="truncate opacity-80"
                          v-html="
                            renderContent(m.reply.content, m.reply.type || 'text', stickerGroups)
                          "
                        ></div>
                      </div>

                      <div
                        class="whitespace-pre-wrap break-words leading-relaxed text-[13.5px] overflow-hidden message-content-mixed"
                        @click="handleMessageContentClick($event)"
                        v-html="renderContent(m.content, undefined, stickerGroups)"
                      ></div>

                      <div class="text-[9px] mt-0.5 theme-text-tertiary text-right">
                        {{ formatTime(m.created_at) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!isMe(m)" class="w-8 flex-shrink-0"></div>
              </div>
            </div>
          </div>

          <!-- 实时预览气泡 -->
          <div
            v-if="showPreviewBubble"
            class="flex items-end gap-2 mb-1 w-full theme-text-primary flex-row-reverse"
          >
            <div class="flex flex-col min-w-0 relative flex-1 items-end">
              <div class="flex items-end gap-1 max-w-[92%] relative flex-row">
                <button
                  class="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors active:scale-90 mb-0.5 theme-text-secondary"
                >
                  <i class="ri-loader-4-line animate-spin text-[9px]"></i>
                </button>
                <div
                  class="relative px-3 py-1.5 shadow-sm transition-all select-none cursor-default message-bubble-target min-w-0 break-words rounded-2xl rounded-br-[0.25rem] opacity-75 chat-bubble-preview"
                >
                  <div
                    v-if="text"
                    class="whitespace-pre-wrap break-words leading-relaxed text-[13.5px]"
                    v-html="renderContent(text, undefined, stickerGroups)"
                  ></div>
                  <div v-if="!text" class="text-[13.5px] theme-text-secondary italic">预览消息</div>
                  <div class="text-[9px] mt-0.5 theme-text-tertiary text-right">
                    {{ isSending ? '发送中...' : '即将发送' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 骨架屏效果 -->
        <div v-if="loadingMessages && messages.length === 0" class="space-y-6">
          <div
            v-for="n in 6"
            :key="n"
            :class="[
              'flex items-end gap-2 animate-pulse',
              n % 3 === 0 ? 'flex-row-reverse' : 'flex-row',
            ]"
          >
            <!-- 消息头像骨架 -->
            <div
              v-if="n % 3 !== 0"
              class="w-8 h-8 rounded-full flex-shrink-0 chat-skeleton-avatar"
            ></div>
            <div :class="['flex flex-col space-y-2', n % 3 === 0 ? 'items-end' : 'items-start']">
              <div class="w-16 h-2 rounded chat-skeleton-line"></div>
              <div
                class="px-3 py-1.5 rounded-2xl min-h-[40px] chat-skeleton-bubble"
                :style="{ width: Math.random() * 100 + 100 + 'px' }"
              >
                <div class="w-full h-2 rounded mb-2 chat-skeleton-line"></div>
                <div class="w-2/3 h-2 rounded chat-skeleton-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div
        ref="composerShellRef"
        :class="[
          'fixed left-0 right-0 z-50 max-w-[600px] mx-auto w-[calc(100%_-_24px)] p-2.5 border rounded-2xl transition-all duration-300 overflow-visible backdrop-blur-2xl',
          'theme-card-strong',
          'liquid-glass-shell liquid-glass-chat-shell',
        ]"
        :style="{ bottom: `${composerBottomOffset}px` }"
      >
        <!-- 回复预览 -->
        <div
          v-if="replyingTo?.content"
          class="mx-1 mb-3 px-3 py-2 theme-card-soft rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div class="flex-1 min-w-0 pr-2">
            <div
              class="text-[9px] theme-text-secondary font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5"
            >
              正在回复
              {{
                replyingTo.user?.nickname ||
                (replyingTo.user?.user_id
                  ? '用户' + String(replyingTo.user.user_id).slice(-5)
                  : '用户')
              }}
            </div>
            <div
              class="text-xs theme-text-tertiary truncate opacity-80"
              v-html="renderContent(replyingTo.content, replyingTo.type || 'text', stickerGroups)"
            ></div>
          </div>
          <button
            @click="cancelReply"
            class="w-7 h-7 flex items-center justify-center chat-nav-action active:scale-90 transition-all"
          >
            <i class="ri-close-fill text-lg"></i>
          </button>
        </div>
        <div class="relative">
          <!-- 表情按钮 -->
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <button
                @click.stop="showEmojiPicker = !showEmojiPicker"
                title="Emoji"
                class="w-8 h-8 flex-shrink-0 grid place-items-center rounded-full chat-toolbar-action cursor-pointer transition-colors active:scale-90"
              >
                <i class="ri-emotion-happy-fill text-lg"></i>
              </button>

              <label
                class="w-8 h-8 inline-flex items-center justify-center rounded-full chat-toolbar-action cursor-pointer transition-colors"
              >
                <input type="file" accept="image/*" class="hidden" @change="handleImageSelected" />
                <i class="ri-image-fill text-lg"></i>
              </label>
            </div>

            <button
              @click="openSettings"
              title="Profile Settings"
              class="w-8 h-8 flex-shrink-0 inline-flex items-center justify-center rounded-full cursor-pointer transition-colors"
            >
              <span
                class="w-6 h-6 rounded-full theme-card-soft overflow-hidden flex items-center justify-center"
              >
                <img
                  v-if="user?.avatar_url"
                  :src="normalizeAvatarUrl(user.avatar_url)"
                  class="w-full h-full object-cover"
                />
                <i v-else class="ri-user-3-fill text-[10px]"></i>
              </span>
            </button>
          </div>

          <!-- 表情面板（传送到 body，固定定位） -->
          <Teleport to="body">
            <div
              v-if="showEmojiPicker"
              class="fixed left-1/2 -translate-x-1/2 z-[999] p-4 theme-card-strong rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 pointer-events-auto max-w-[600px] w-[calc(100vw-32px)] border"
              :style="{ bottom: `${emojiPanelBottomOffset}px` }"
            >
              <div class="flex items-center justify-between mb-4 px-1">
                <div class="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
                  <button
                    v-for="(tab, id) in { emoji: { name: 'Twemoji' }, ...stickerGroups }"
                    :key="id"
                    @click="emojiActiveTab = id"
                    :class="[
                      'text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap px-1 pb-1',
                      emojiActiveTab === id
                        ? 'theme-text-primary border-b-1 border-[var(--card-divider)]'
                        : 'theme-text-secondary',
                    ]"
                  >
                    {{ tab.name }}
                  </button>
                </div>
                <button
                  @click="showEmojiPicker = false"
                  class="w-8 h-8 flex-shrink-0 flex items-center justify-center chat-nav-action"
                >
                  <i class="ri-close-fill"></i>
                </button>
              </div>
              <div class="max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                <div v-if="emojiActiveTab === 'emoji'" class="space-y-6">
                  <div v-for="(group, name) in emojiGroups" :key="name">
                    <div
                      class="text-[9px] font-bold uppercase tracking-widest theme-text-secondary mb-3 ml-1"
                    >
                      {{ name }}
                    </div>
                    <div class="grid grid-cols-7 sm:grid-cols-8 gap-2">
                      <button
                        v-for="emoji in group"
                        :key="emoji.code"
                        @click="addEmoji(emoji.char)"
                        class="aspect-square grid place-items-center rounded-xl transition-all active:scale-95 group chat-emoji-btn"
                      >
                        <img
                          :src="getEmojiUrl(emoji.code)"
                          class="w-7 h-7 group-hover:scale-110 transition-transform"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="stickerGroups[emojiActiveTab]"
                  class="grid grid-cols-5 sm:grid-cols-6 gap-3 pb-2"
                >
                  <button
                    v-for="item in stickerGroups[emojiActiveTab].items"
                    :key="item.key"
                    @click="addSticker(emojiActiveTab, item)"
                    class="aspect-square grid place-items-center rounded-xl transition-all active:scale-95 group p-1 chat-emoji-btn"
                  >
                    <img
                      :src="item.val"
                      loading="lazy"
                      class="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  </button>
                </div>
                <div
                  v-else
                  class="flex flex-col items-center justify-center py-10 theme-text-secondary"
                >
                  <i v-if="stickerLoading" class="ri-loader-4-line animate-spin text-2xl mb-2"></i>
                  <span class="text-[10px] font-bold uppercase tracking-widest">
                    {{ stickerLoading ? '贴纸加载中...' : '贴纸准备中' }}
                  </span>
                </div>
              </div>
            </div>
          </Teleport>

          <div ref="composerInputRowRef" class="flex items-center gap-2 max-w-5xl mx-auto min-w-0">
            <div
              class="flex-1 min-w-0 h-10 flex items-center gap-1 rounded-2xl px-2 transition-all shadow-inner chat-composer-input liquid-glass-chat-input"
            >
              <div
                ref="messageInput"
                contenteditable="true"
                :placeholder="hasToken() ? '说点什么吧' : '请先登录'"
                @input="handleInput"
                @paste="handlePaste"
                @keydown.enter.exact.prevent="send"
                @blur="handleComposerBlur"
                @keyup="saveRange"
                @mouseup="saveRange"
                @touchend="saveRange"
                :class="[
                  'flex-1 min-w-0 w-full h-full max-w-full bg-transparent border-none outline-none text-sm px-1 py-2 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-all leading-5 sticker-input',
                  !hasToken() ? 'pointer-events-none' : '',
                ]"
              ></div>

              <button
                v-if="text"
                @click="clearText"
                class="w-9 h-9 flex-shrink-0 grid place-items-center theme-text-secondary hover:text-rose-400 transition-colors"
              >
                <i class="ri-close-line text-lg"></i>
              </button>
            </div>

            <button
              @click="send"
              :disabled="!hasToken() || !text.trim() || isSending"
              class="w-10 h-10 flex-shrink-0 grid place-items-center rounded-xl active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none theme-button-primary"
            >
              <i v-if="isSending" class="ri-loader-4-line animate-spin text-sm"></i>
              <i v-else class="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 资料设置 -->
      <div
        v-if="showSettings"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 theme-overlay"
      >
        <div class="theme-card w-full max-w-[280px] rounded-[2rem] shadow-2xl overflow-hidden">
          <div class="p-6">
            <div class="flex flex-col items-center mb-6">
              <div
                class="w-16 h-16 rounded-full theme-card-soft flex items-center justify-center overflow-hidden shadow-inner mb-2 relative"
              >
                <div
                  v-if="loadingUserSettings"
                  class="absolute inset-0 theme-card-soft animate-pulse z-10"
                ></div>
                <template v-if="user?.avatar_url">
                  <img
                    :src="normalizeAvatarUrl(user.avatar_url)"
                    class="w-full h-full object-cover"
                  />
                </template>
                <i v-else class="ri-user-3-fill theme-text-secondary text-2xl"></i>
              </div>
              <h3 class="text-base font-bold theme-text-primary">个人设置</h3>
              <p class="text-[10px] theme-text-secondary">修改昵称和同步 QQ 头像</p>
            </div>
            <div class="space-y-4">
              <div class="space-y-1">
                <label class="text-[9px] font-bold uppercase theme-text-secondary ml-1">昵称</label>
                <div
                  v-if="loadingUserSettings"
                  class="h-9 w-full theme-card-soft animate-pulse rounded-xl"
                ></div>
                <input
                  v-else
                  v-model="settingsNickname"
                  class="w-full px-4 py-2 theme-input theme-card-soft rounded-xl text-sm outline-none transition-all"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-bold uppercase theme-text-secondary ml-1"
                  >QQ 号 (同步头像)</label
                >
                <div
                  v-if="loadingUserSettings"
                  class="h-9 w-full theme-card-soft animate-pulse rounded-xl"
                ></div>
                <input
                  v-else
                  v-model="settingsQQ"
                  class="w-full px-4 py-2 theme-input theme-card-soft rounded-xl text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-8">
              <button
                @click="showSettings = false"
                :disabled="isSavingSettings"
                class="py-2 theme-link rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
              >
                取消
              </button>
              <button
                @click="applySettings"
                :disabled="isSavingSettings"
                class="py-2 theme-button-primary rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i v-if="isSavingSettings" class="ri-loader-4-line animate-spin"></i>
                {{ isSavingSettings ? '正在保存' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 他人资料卡 -->
      <div
        v-if="showProfileViewer"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 theme-overlay"
        @click.self="showProfileViewer = false"
      >
        <div
          class="theme-card w-full max-w-[300px] rounded-[1.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative"
        >
          <!-- 关闭按钮 -->
          <button
            @click="showProfileViewer = false"
            class="absolute top-4 right-4 w-7 h-7 flex items-center justify-center theme-text-secondary chat-close-btn active:scale-90 transition-all z-10"
          >
            <i class="ri-close-fill text-lg"></i>
          </button>

          <div class="p-6">
            <div class="flex items-center gap-4">
              <!-- 头像区域 -->
              <div class="flex-shrink-0 relative">
                <div
                  class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shadow"
                >
                  <template v-if="viewedProfile?.avatar_url">
                    <img
                      :src="normalizeAvatarUrl(viewedProfile.avatar_url)"
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover"
                    />
                  </template>
                  <i v-else class="ri-user-3-fill theme-text-secondary text-2xl"></i>
                </div>
              </div>

              <!-- 资料信息 -->
              <div class="flex-1 min-w-0">
                <h3
                  v-if="loadingProfile && !viewedProfile?.nickname"
                  class="h-5 w-24 theme-skeleton-line animate-pulse rounded mb-1"
                ></h3>
                <h3
                  v-else
                  class="text-base font-bold theme-text-primary truncate mb-0.5 whitespace-nowrap"
                >
                  {{
                    viewedProfile?.nickname ||
                    (viewedProfile?.user_id
                      ? '用户' + String(viewedProfile.user_id).slice(-5)
                      : '用户')
                  }}
                </h3>

                <p
                  v-if="loadingProfile"
                  class="h-3 w-32 theme-skeleton-line animate-pulse rounded mb-1.5"
                ></p>
                <p v-else class="text-[10px] theme-text-secondary">
                  {{ formatLastSeen(viewedProfile?.last_seen_at) }}
                </p>

                <!-- 校友身份提示 -->
                <div
                  v-if="viewedProfile?.is_alumni"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 theme-card-soft text-blue-600 rounded-full text-[9px] font-bold"
                >
                  <i class="ri-graduation-cap-fill"></i>
                  TA是你的校友
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 隐私说明弹窗 -->
      <div
        v-if="showPrivacyInfo"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-6 theme-overlay"
        @click.self="showPrivacyInfo = false"
      >
        <div
          class="theme-card w-full max-w-[300px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          <div class="p-6">
            <div class="flex items-center gap-2 mb-4 theme-text-primary">
              <i class="fa-solid fa-shield-halved text-blue-500"></i>
              <h3 class="font-bold text-sm">隐私与校友功能说明</h3>
            </div>
            <div class="space-y-3 text-[12px] leading-relaxed">
              <p class="theme-text-secondary">
                为了在留言板中实现在校校友身份识别，我们需要对您 UNIRUN
                授权数据中的学校ID进行提取与比对。
              </p>
              <p class="theme-text-primary">
                <strong
                  >使用留言功能即视为您已知晓并同意我们基于学校标识字段进行校友匹配分析。</strong
                >
              </p>
            </div>
            <button
              @click="showPrivacyInfo = false"
              class="mt-6 w-full py-2.5 theme-button-primary rounded-xl text-xs font-bold active:scale-95 transition-all"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>

      <!-- 消息操作弹窗 -->
      <Teleport to="body">
        <div
          v-if="contextMenu.show"
          class="fixed inset-0 z-[1000]"
          @click="closeMenu"
          @contextmenu.prevent="closeMenu"
          @scroll.prevent
        >
          <div
            class="absolute theme-card-strong backdrop-blur-xl shadow-2xl rounded-2xl p-1.5 min-w-[140px] chat-menu-shadow"
            :class="[
              contextMenu.direction === 'down'
                ? 'menu-pop-animation origin-top'
                : 'menu-pop-animation-up origin-bottom',
            ]"
            :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
          >
            <button
              v-if="isMe(contextMenu.message)"
              @click="
                deleteMessage(contextMenu.message.id);
                closeMenu();
              "
              :disabled="isDeleting"
              class="w-full text-left px-3 py-2 text-xs flex items-center gap-2 chat-context-item text-rose-500 rounded-xl transition-colors disabled:opacity-50"
            >
              <i v-if="isDeleting" class="ri-loader-4-line animate-spin"></i>
              <i v-else class="ri-delete-bin-line"></i>
              {{ isDeleting ? '正在删除...' : '删除消息' }}
            </button>
            <button
              @click="
                startReply(contextMenu.message);
                closeMenu();
              "
              class="w-full text-left px-3 py-2 text-xs flex items-center gap-2 chat-context-item theme-text-primary rounded-xl transition-colors"
            >
              <i class="ri-reply-fill theme-text-primary"></i>
              回复
            </button>
          </div>
        </div>
      </Teleport>

      <!-- 大图查看器 -->
      <Teleport to="body">
        <div
          v-if="viewedImage"
          class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4"
          @click.self="viewedImage = null"
        >
          <!-- 将关闭按钮置于遮罩右上角 -->
          <button
            @click="viewedImage = null"
            class="absolute top-4 right-4 z-30 bg-black/40 text-white rounded-full p-2 hover:bg-black/60"
          >
            <i class="ri-close-fill"></i>
          </button>
          <div class="max-w-[95vw] max-h-[95vh] relative flex items-center justify-center">
            <!-- 加载占位: 保持固定的最大尺寸以减少布局跳动 -->
            <div
              v-if="imageModalLoading"
              class="w-[70vw] max-w-[900px] h-[60vh] theme-card-soft rounded-md flex items-center justify-center animate-pulse"
            >
              <div class="flex flex-col items-center gap-3">
                <i class="ri-loader-4-line animate-spin text-2xl theme-text-secondary"></i>
                <div class="text-sm theme-text-tertiary">图片加载中...</div>
              </div>
            </div>

            <img
              v-show="!imageModalLoading"
              :src="getModalImageSrc(viewedImage)"
              @load="imageModalLoading = false"
              @error="imageModalLoading = false"
              class="max-w-[95vw] max-h-[95vh] m-auto rounded-md shadow-xl object-contain"
            />
          </div>
        </div>
      </Teleport>

      <ConfirmDialog ref="confirmRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, inject, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/layout/AppHeader.vue';
import {
  MessageClient,
  formatTime,
  getEmojiUrl,
  messageSdkConfig,
  normalizeAvatarUrl,
  getCachedAvatarUrl,
  renderContent,
} from '@/sdk/message';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import emojiGroups from '@/assets/data/emojis.json';
import { getViewportMetrics, restoreViewportPosition } from '@/utils/viewport';
import { useDataStore } from '@/composables/useDataStore';
import { useChatStore } from '@/composables/useChatStore';
import { useStickerCache } from '@/composables/useStickerCache';
import { useThemeStore } from '@/composables/useTheme';

// ==================== 依赖注入 ====================
const showMessage = inject('showMessage');
const setLayoutHidden = inject('setLayoutHidden', () => {});
const goBack = inject('goBack', null);
const { token, userInfo, clearAllData } = useDataStore();
const {
  chatUser,
  chatUserId,
  setCachedChatUser,
  getCachedChatUserId,
  markChatSeen,
  clearChatData,
  setChatStickerCache,
  getChatStickerCache,
} = useChatStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

// ==================== 常量配置 ====================
const API_BASE = messageSdkConfig.apiBaseUrl;
const client = new MessageClient({ baseUrl: API_BASE });

// ==================== 响应式状态 ====================
// 消息相关
const messages = ref([]);
const loadingMessages = ref(true);
const loadingMore = ref(false);
const currentPage = ref(1);
const hasNext = ref(false);

// 用户相关
const user = ref(null);
const viewedProfile = ref(null);
const loadingProfile = ref(false);
const loadingUserSettings = ref(false);

// UI 状态
const showProfileViewer = ref(false);
const showPrivacyInfo = ref(false);
const showSettings = ref(false);
const showEmojiPicker = ref(false);
const showPreviewBubble = ref(false);
const SINGLE_MESSAGE_GAP_PX = 16;
const COMPOSER_BASE_BOTTOM_PX = 16;
const DEFAULT_MESSAGE_BOTTOM_INSET = 120;
const messageListPaddingTop = ref(68);
const messageBottomInset = ref(DEFAULT_MESSAGE_BOTTOM_INSET);
const composerBottomOffset = ref(COMPOSER_BASE_BOTTOM_PX);

// 输入相关
const text = ref('');
const replyingTo = ref(null);
const messageInput = ref(null);
const lastRange = ref(null);

// 表情贴纸
const chatBootstrapFinished = ref(false);
const emojiActiveTab = ref('emoji');
const emojiPanelBottomOffset = ref(0); // 动态计算的面板底部位置
const {
  stickerGroups,
  stickerLoading,
  hydrateStickerCache,
  ensureStickerTabReady,
  loadStickers,
  triggerSilentStickerRefresh,
} = useStickerCache({
  getChatStickerCache,
  setChatStickerCache,
});

console.log(
  '[ChatPage] useStickerCache initialized, getChatStickerCache:',
  typeof getChatStickerCache,
  'setChatStickerCache:',
  typeof setChatStickerCache,
);

// 设置相关
const settingsNickname = ref('');
const settingsQQ = ref('');
const isSavingSettings = ref(false);

// 操作状态
const isSending = ref(false);
const isDeleting = ref(false);

// 交互状态
const swipeOffsets = reactive({});
const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  message: null,
  direction: 'down',
});

// DOM 引用
const messagesContainer = ref(null);
const loadMoreSentinel = ref(null);
const composerShellRef = ref(null);
const composerInputRowRef = ref(null);
const appHeaderRef = ref(null);
const confirmRef = ref(null);
const viewedImage = ref(null);
const imageModalLoading = ref(false);

// 触摸交互状态
let longPressTimer = null;
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = ref(false);
let scrollObserver = null;
let layoutMeasureFrame = 0;
let floatingLayoutObserver = null;
let authExpiredNotified = false;
let keyboardWasVisible = false;
let messagesTouchStartY = 0;

// ==================== 工具函数 ====================
const getToken = () => token.value || '';

const hasToken = () => !!getToken();

function measureFloatingLayout() {
  const { visibleBottom, keyboardInset } = getViewportMetrics();
  const keyboardVisible = keyboardInset > 0;

  composerBottomOffset.value = COMPOSER_BASE_BOTTOM_PX + keyboardInset;
  if (keyboardWasVisible && !keyboardVisible) {
    restoreViewportPosition();
  }
  keyboardWasVisible = keyboardVisible;

  const messageRect = messagesContainer.value?.getBoundingClientRect?.();
  const headerElement = appHeaderRef.value?.getHeaderElement?.();
  const headerRect = headerElement?.getBoundingClientRect?.();
  const composerRect = composerShellRef.value?.getBoundingClientRect?.();
  const inputRowRect = composerInputRowRef.value?.getBoundingClientRect?.();
  const messageContainerEl = messagesContainer.value;
  const wasNearBottom = messageContainerEl
    ? messageContainerEl.scrollHeight -
        (messageContainerEl.scrollTop + messageContainerEl.clientHeight) <=
      Math.max(24, SINGLE_MESSAGE_GAP_PX * 2)
    : false;

  if (headerRect) {
    let topPadding = Math.max(56, Math.ceil(headerRect.bottom + 10));
    if (!hasToken()) topPadding += 28;
    messageListPaddingTop.value = topPadding;
  }

  const anchorTop = Math.min(
    inputRowRect?.top ?? Number.POSITIVE_INFINITY,
    composerRect?.top ?? Number.POSITIVE_INFINITY,
  );
  if (Number.isFinite(anchorTop)) {
    const viewportBottom = Math.min(messageRect?.bottom ?? Number.POSITIVE_INFINITY, visibleBottom);
    const overlayHeight = Math.max(0, Math.ceil(viewportBottom - anchorTop));
    const nextBottomInset = Math.max(
      SINGLE_MESSAGE_GAP_PX,
      Math.ceil(overlayHeight + SINGLE_MESSAGE_GAP_PX),
    );
    const overlayChanged = Math.abs(nextBottomInset - messageBottomInset.value) > 0.5;
    messageBottomInset.value = nextBottomInset;

    // Keep the latest message above the whole composer shell (not only the input line).
    if (overlayChanged && wasNearBottom) {
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
    return;
  }

  messageBottomInset.value = DEFAULT_MESSAGE_BOTTOM_INSET;
}

function handleComposerBlur() {
  saveRange();
  setTimeout(() => {
    const { keyboardInset } = getViewportMetrics();

    if (keyboardInset <= 0) {
      keyboardWasVisible = false;
      composerBottomOffset.value = COMPOSER_BASE_BOTTOM_PX;
      restoreViewportPosition();
    }
    scheduleFloatingLayoutMeasure();
  }, 120);
}

function scheduleFloatingLayoutMeasure() {
  if (layoutMeasureFrame) cancelAnimationFrame(layoutMeasureFrame);
  layoutMeasureFrame = requestAnimationFrame(() => {
    measureFloatingLayout();
    layoutMeasureFrame = 0;
  });
}

function handleMessagesTouchStart(e) {
  if (!e?.touches?.length) return;
  messagesTouchStartY = e.touches[0].clientY;
}

function handleMessagesTouchMove(e) {
  const el = messagesContainer.value;
  if (!el || !e?.touches?.length) return;

  const currentY = e.touches[0].clientY;
  const deltaY = currentY - messagesTouchStartY;
  const atTop = el.scrollTop <= 0;
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

  // Prevent iOS rubber-band overscroll from exposing page background.
  if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
    e.preventDefault();
  }
}

function bindMessageScrollLock() {
  const el = messagesContainer.value;
  if (!el) return;
  el.addEventListener('touchstart', handleMessagesTouchStart, { passive: true });
  el.addEventListener('touchmove', handleMessagesTouchMove, { passive: false });
}

function unbindMessageScrollLock() {
  const el = messagesContainer.value;
  if (!el) return;
  el.removeEventListener('touchstart', handleMessagesTouchStart);
  el.removeEventListener('touchmove', handleMessagesTouchMove);
}

const isMe = (m) => {
  if (user.value?.user_id && m.user?.user_id) {
    return String(user.value.user_id) === String(m.user.user_id);
  }

  const cachedId = userInfo.value?.userId || chatUserId.value || getCachedChatUserId();

  if (cachedId && m.user?.user_id) {
    return String(cachedId) === String(m.user.user_id);
  }
  return false;
};

const showToast = (msg, type = 'info') => {
  if (appHeaderRef.value?.show) {
    appHeaderRef.value.show(msg, type);
    return;
  }

  if (showMessage) showMessage(msg, type);
};

// ==================== 导航处理 ====================
const router = useRouter();
function onBack() {
  try {
    setLayoutHidden(false);
  } catch (e) {
    console.error('Failed to restore layout', e);
  }

  if (typeof goBack === 'function') {
    goBack();
    return;
  }
  if (router) {
    router.push({ name: 'home' }).catch((err) => {
      if (err.name !== 'NavigationDuplicated') {
        window.location.href = '/';
      }
    });
  } else {
    window.location.href = '/';
  }
}

// ==================== 表情贴纸加载 ====================

// 保持光标位置
function saveRange() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    // 只有当 range 在 messageInput 内部时才保存
    if (messageInput.value && messageInput.value.contains(range.commonAncestorContainer)) {
      lastRange.value = range;
    }
  }
}

/**
 * 将图片文件压缩/转换为 WebP，确保小于 maxBytes
 */
async function compressImageToWebP(file, maxBytes = 2 * 1024 * 1024, maxWidth = 1200) {
  if (!file) throw new Error('file required');

  const imgBitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxWidth / imgBitmap.width);
  const width = Math.max(1, Math.round(imgBitmap.width * ratio));
  const height = Math.max(1, Math.round(imgBitmap.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgBitmap, 0, 0, width, height);

  // 二分法寻找质量，确保小于 maxBytes
  let low = 0.45,
    high = 0.95;
  let lastGood = null;

  for (let i = 0; i < 6; i++) {
    const q = (low + high) / 2;
    // eslint-disable-next-line no-await-in-loop
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', q));
    if (!blob) break;
    if (blob.size <= maxBytes) {
      lastGood = blob;
      low = q;
    } else {
      high = q;
    }
  }

  if (!lastGood) {
    const fallback = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.8));
    if (fallback && fallback.size <= maxBytes) return fallback;
    if (fallback) lastGood = fallback;
  }

  return lastGood;
}

function handleImageSelected(ev) {
  const files = ev.target.files;
  if (!files || !files.length) return;

  Array.from(files).forEach((f) => {
    insertPendingUploadImage(f);
  });

  // 清空选择，允许重复选同一张图
  ev.target.value = '';
}

function insertPendingUploadImage(file) {
  if (!file || !messageInput.value) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result;
    if (!base64 || typeof base64 !== 'string') return;
    const imgHtml = `<img src="${base64}" data-pending-upload="true" class="inline-block h-12 max-w-[100px] object-cover rounded mx-1 align-middle shadow-sm transition-transform hover:scale-105 cursor-pointer" />`;

    messageInput.value.focus();

    let range = lastRange.value;
    if (!range) {
      // 兜底：尝试获取当前选区，如果仍在 input 内
      const sel = window.getSelection();
      if (sel.rangeCount > 0 && messageInput.value.contains(sel.anchorNode)) {
        range = sel.getRangeAt(0);
      }
    }

    if (range) {
      range.deleteContents();
      // 创建 fragment 插入
      const el = document.createElement('div');
      el.innerHTML = imgHtml;
      const frag = document.createDocumentFragment();
      let node, lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      range.collapse(false);
      // 更新选区到插入内容之后
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      lastRange.value = range; // 更新保存的 range
    } else {
      // 追加到末尾
      messageInput.value.insertAdjacentHTML('beforeend', imgHtml);
      // 移动光标到末尾
      const range = document.createRange();
      range.selectNodeContents(messageInput.value);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      lastRange.value = range;
    }

    // 手动触发 input handler 更新 text
    handleInput({ target: messageInput.value });
  };

  reader.onerror = () => {
    showToast('图片读取失败', 'error');
  };

  reader.readAsDataURL(file);
}

function handlePaste(ev) {
  const clipboardItems = Array.from(ev.clipboardData?.items || []);
  if (!clipboardItems.length) return;

  const imageFiles = clipboardItems
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter(Boolean);

  if (!imageFiles.length) return;

  ev.preventDefault();

  imageFiles.forEach((file) => {
    insertPendingUploadImage(file);
  });
}

// 配合 nextTick 滚动
watch(showPreviewBubble, (val) => {
  if (val) nextTick(() => scrollToBottom(false));
});

watch([showEmojiPicker, replyingTo], () => {
  nextTick(() => {
    scheduleFloatingLayoutMeasure();
    scrollToBottom(false);

    // 回复框状态变化时，也要更新面板位置
    if (showEmojiPicker.value) {
      const composerHeight = composerShellRef.value?.offsetHeight || 140;
      emojiPanelBottomOffset.value = composerBottomOffset.value + composerHeight;
    }
  });
});

// 表情面板打开时，确保位置准确
watch(showEmojiPicker, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      // 获取输入框的实际高度，计算面板的底部位置
      const composerHeight = composerShellRef.value?.offsetHeight || 140;
      emojiPanelBottomOffset.value = composerBottomOffset.value + composerHeight;
    });
  }
});

// 输入框距离底部变化时，也更新面板位置
watch(composerBottomOffset, (newOffset) => {
  if (showEmojiPicker.value) {
    const composerHeight = composerShellRef.value?.offsetHeight || 140;
    emojiPanelBottomOffset.value = newOffset + composerHeight;
  }
});

watch(
  () => token.value,
  () => {
    nextTick(() => {
      scheduleFloatingLayoutMeasure();
    });
  },
);

// ==================== 滚动和观察器 ====================
const setupIntersectionObserver = () => {
  if (scrollObserver) scrollObserver.disconnect();

  scrollObserver = new IntersectionObserver(
    (entries) => {
      if (
        entries[0].isIntersecting &&
        hasNext.value &&
        !loadingMore.value &&
        !loadingMessages.value
      ) {
        loadMore();
      }
    },
    {
      root: messagesContainer.value,
      threshold: 0.1,
      rootMargin: '100px 0px 0px 0px',
    },
  );

  if (loadMoreSentinel.value) {
    scrollObserver.observe(loadMoreSentinel.value);
  }
};

watch(loadMoreSentinel, (el) => {
  if (el && !scrollObserver) {
    setupIntersectionObserver();
  } else if (el && scrollObserver) {
    scrollObserver.observe(el);
  }
});

watch(loadingMessages, (isLoading) => {
  if (!isLoading) {
    nextTick(() => scrollToBottom(false));
  }
});

watch(
  messages,
  (newVal, oldVal) => {
    if (!loadingMore.value) {
      nextTick(() => scrollToBottom(oldVal.length > 0));
    }
  },
  { deep: false },
);

// ==================== 错误处理 ====================
function clearAuthState() {
  client.setToken(null, { reconnect: false });
  client.disconnectSocket();
  user.value = null;
  clearAllData();
  clearChatData();
}

function handleApiError(e, defaultMsg) {
  console.error(defaultMsg || 'API Error', e);
  if (e && (e.code === 'unauthorized' || /unauthor/i.test(String(e.message || '')))) {
    clearAuthState();
    loadingMessages.value = false;
    showToast('请先登录', 'warning');
    return;
  }
  showToast(defaultMsg || '请求失败', 'error');
}

// ==================== API 调用 ====================

function getLatestMessageSeenAt(messageList = []) {
  const latest = messageList[messageList.length - 1];
  const createdAt = String(latest?.created_at || '').trim();
  return createdAt || new Date().toISOString();
}

async function fetchUser() {
  try {
    const data = await client.getProfile();
    authExpiredNotified = false;
    user.value = data.user;
    if (data.user?.user_id) {
      // Cache current user for isMe checks before profile request finishes.
      setCachedChatUser(data.user);
    }
  } catch (e) {
    handleApiError(e, '获取用户信息失败');
  }
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
    hasNext.value = data.hasNext ?? msgs.length === size;
    currentPage.value = 1;
    markChatSeen(getLatestMessageSeenAt(msgs));
    triggerSilentStickerRefresh();

    loadingMessages.value = false;
    await nextTick();
    scrollToBottom(false);
  } catch (e) {
    handleApiError(e, '消息加载失败');
    loadingMessages.value = false;
  }
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
    hasNext.value = data.hasNext ?? nextMsgs.length === size;
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

function handleInput(e) {
  text.value = e.target.innerHTML;
  // 处理一些浏览器会自动插入 <br> 的情况
  if (text.value === '<br>') {
    text.value = '';
    e.target.innerHTML = '';
  }
  // 更新预览气泡显示状态
  showPreviewBubble.value = text.value.trim().length > 0;
  // 固定输入框高度时，始终滚动到末尾，只显示最新输入区域
  e.target.scrollTop = e.target.scrollHeight;
  e.target.scrollLeft = e.target.scrollWidth;
}

async function send() {
  if (!text.value.trim()) return;
  if (isSending.value) return;
  isSending.value = true;

  try {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = text.value;

    const parts = [];

    // 递归处理节点，支持异步上传
    async function processNodes(nodes) {
      for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const val = node.textContent;
          if (val) parts.push({ type: 'text', value: val });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'IMG') {
            const src = node.getAttribute('src');
            // 识别待上传图片
            if (node.hasAttribute('data-pending-upload') && src && src.startsWith('data:')) {
              try {
                const res = await fetch(src);
                const blob = await res.blob();
                const compressed = await compressImageToWebP(blob);
                const uploadRes = await client.uploadImage(compressed || blob);
                if (uploadRes && uploadRes.fileKey) {
                  parts.push({ type: 'image', value: uploadRes.fileKey });
                }
              } catch (err) {
                console.error('Image upload failed', err);
                // 依然保留一个占位或忽略，这里选择忽略以免阻塞
              }
            } else if (node.hasAttribute('atk-emoticon')) {
              parts.push({ type: 'sticker', value: node.getAttribute('atk-emoticon') });
            }
          } else if (node.tagName === 'BR') {
            // 换行
          } else {
            // 递归其他元素
            if (node.childNodes && node.childNodes.length > 0) {
              await processNodes(node.childNodes);
            } else {
              // 兜底提取文本
              const val = node.innerText;
              if (val) parts.push({ type: 'text', value: val });
            }
          }
        }
      }
    }

    await processNodes(wrapper.childNodes);

    // 合并文本
    const mergedParts = [];
    parts.forEach((p) => {
      const last = mergedParts[mergedParts.length - 1];
      if (p.type === 'text' && last && last.type === 'text') {
        last.value += p.value;
      } else {
        mergedParts.push(p);
      }
    });

    if (mergedParts.length === 0) return;

    // 发送
    await client.sendMessage(mergedParts, replyingTo.value?.id);

    // 成功后清理
    clearText();
    cancelReply();
    showPreviewBubble.value = false;
    await nextTick();
    scrollToBottom();
  } catch (e) {
    handleApiError(e, '发送失败');
  } finally {
    isSending.value = false;
  }
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

function clearText() {
  text.value = '';
  if (messageInput.value) {
    messageInput.value.innerHTML = '';
  }
  showPreviewBubble.value = false;
}

function cancelReply() {
  replyingTo.value = null;
}

async function scrollToOriginalMessage(reply) {
  if (!reply) return;

  const targetId = reply.id;
  if (!targetId) {
    showToast('原消息不可用', 'info');
    return;
  }

  // 尝试在 DOM 中查找目标元素
  let element = document.getElementById(`msg-${targetId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const bubble = element.querySelector('.message-bubble-target');
    const targetEl = bubble || element;
    targetEl.classList.add('message-highlight');
    setTimeout(() => {
      targetEl.classList.remove('message-highlight');
    }, 2000);
    return;
  }

  // 未在 DOM 中找到，检查是否在已加载的消息数组中
  const existsInList = messages.value.some((m) => String(m.id) === String(targetId));
  if (existsInList) {
    showToast('正在定位...', 'info');
    await nextTick();
    element = document.getElementById(`msg-${targetId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const bubble = element.querySelector('.message-bubble-target');
      const targetEl = bubble || element;
      targetEl.classList.add('message-highlight');
      setTimeout(() => {
        targetEl.classList.remove('message-highlight');
      }, 2000);
      return;
    }
  }

  // 如果目标消息既不在 DOM 也不在当前数组中，可能是历史消息未加载
  if (hasNext.value) {
    showToast('正在加载历史消息以定位原消息...', 'info');
    // 反复加载历史页直到找到目标或没有更多历史
    while (hasNext.value) {
      try {
        await loadMore();
      } catch (e) {
        break;
      }
      await nextTick();
      element = document.getElementById(`msg-${targetId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const bubble = element.querySelector('.message-bubble-target');
        const targetEl = bubble || element;
        targetEl.classList.add('message-highlight');
        setTimeout(() => {
          targetEl.classList.remove('message-highlight');
        }, 2000);
        return;
      }
    }
  }

  // 未能找到，提示更中性的消息（不再直接断言已删除）
  showToast('原消息未加载或已被删除', 'info');
}

async function deleteMessage(id) {
  const ok = await confirmRef.value.show({ title: '确认删除', message: '确认删除该消息？' });
  if (!ok) return;
  isDeleting.value = true;
  try {
    await client.deleteMessage(id);
    messages.value = messages.value.filter((m) => m.id !== id);
    showToast('删除成功', 'success');
  } catch (e) {
    showToast('删除失败', 'error');
  } finally {
    isDeleting.value = false;
  }
}

async function applySettings() {
  if (isSavingSettings.value) return;
  isSavingSettings.value = true;
  try {
    const data = await client.updateUser({
      nickname: settingsNickname.value.trim(),
      qq: settingsQQ.value.trim(),
    });

    // 更新当前用户状态
    user.value = data.user;
    // 同步更新缓存
    setCachedChatUser(data.user);

    showSettings.value = false;
    showToast('更新成功', 'success');
  } catch (e) {
    showToast('更新失败', 'error');
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
    setCachedChatUser(data.user);
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

  const rect = targetEl.getBoundingClientRect();
  const menuWidth = 140;
  const isMyMsg = isMe(m);
  const menuHeight = isMyMsg ? 110 : 60;

  // 计算水平位置：尽量对齐气泡中心
  let left = rect.left + rect.width / 2 - menuWidth / 2;
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

function addEmoji(char) {
  if (!messageInput.value) return;
  messageInput.value.focus();

  if (lastRange.value) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(lastRange.value);
  }

  document.execCommand('insertText', false, char);
  saveRange();
  handleInput({ target: messageInput.value });
}

function addSticker(groupId, sticker) {
  if (!messageInput.value) return;
  // 为输入框内的表情增加特定 class 以便控制尺寸
  const tag = `<img src="${sticker.val}" atk-emoticon="${sticker.key}" class="atk-emoticon input-sticker" style="height: 1.5em; vertical-align: middle;">`;

  messageInput.value.focus();

  if (lastRange.value) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(lastRange.value);
  }

  document.execCommand('insertHTML', false, tag);
  saveRange();
  handleInput({ target: messageInput.value });
}

watch([showEmojiPicker, chatBootstrapFinished], ([isOpen, isReady]) => {
  if (!isOpen || !isReady) return;

  // cache
  hydrateStickerCache();

  // lazy loading
  ensureStickerTabReady(emojiActiveTab.value);
});

watch(emojiActiveTab, (tab) => {
  if (!showEmojiPicker.value || !chatBootstrapFinished.value) return;
  ensureStickerTabReady(tab);
});
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

function formatDateSeparator(s) {
  return new Date(s).toLocaleDateString();
}

function shouldShowDate(index) {
  if (index === 0) return true;
  return (
    new Date(messages.value[index].created_at).toDateString() !==
    new Date(messages.value[index - 1].created_at).toDateString()
  );
}
function scrollToBottom(smooth = true) {
  if (messagesContainer.value) {
    const target = messagesContainer.value;
    const scroll = () => {
      target.scrollTo({
        top: target.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    };
    scroll();
    setTimeout(scroll, 60);
  }
}

// ==================== 触摸交互处理 ====================
const handleTouchStart = (e, m) => {
  const target = e.currentTarget;

  longPressTimer = setTimeout(() => {
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

  if (!isMe(m) && offset < -50) {
    startReply(m);
  } else if (isMe(m) && offset > 50) {
    startReply(m);
  }

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

function onMessageActionClick(m) {
  // 如果是自己发的，优先处理重试逻辑
  if (m.user?.id === user.value?.id || m.user?.user_id === user.value?.user_id) {
    if (m.__status === 'failed') {
      // 重试：将消息设为 sending 并尝试重新发送
      const idx = messages.value.findIndex((x) => x.id === m.id);
      if (idx === -1) return;
      messages.value[idx].__status = 'sending';
      const contentToSend =
        m.content ||
        (m.type
          ? [{ type: m.type, value: m.content }]
          : [{ type: 'text', value: String(m.content || '') }]);
      client
        .sendMessage(contentToSend, null)
        .then((res) => {
          if (res?.message) {
            const replacedIdx = messages.value.findIndex((x) => x.id === m.id);
            if (replacedIdx !== -1)
              messages.value.splice(replacedIdx, 1, {
                ...res.message,
                user: res.message.user || user.value,
              });
          }
        })
        .catch(() => {
          const failedIdx = messages.value.findIndex((x) => x.id === m.id);
          if (failedIdx !== -1) messages.value[failedIdx].__status = 'failed';
          showToast('重试失败', 'error');
        });
    } else if (m.__status === 'sending') {
      // 发送中，不做任何操作
    } else {
      startReply(m);
    }
  } else {
    startReply(m);
  }
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

// ==================== 图片查看器 ====================
function viewImage(url) {
  if (!url) return;
  imageModalLoading.value = true;
  viewedImage.value = url;
}

function handleMessageContentClick(e) {
  const target = e.target;
  // 检查点击的是否是带有 data-viewer-image 属性的图片
  if (target.tagName === 'IMG' && target.hasAttribute('data-viewer-image')) {
    viewImage(target.src);
  }
}

function getFirstImageSrc(m) {
  if (!m) return null;
  // 支持 content 为数组或旧格式
  if (Array.isArray(m.content)) {
    const imgPart = m.content.find((p) => p.type === 'image');
    if (imgPart) return client.getImageUrl(imgPart.value);
  }
  if (m.type === 'image') return m.content;
  return null;
}

function contentHasType(m, t) {
  if (!m) return false;
  if (Array.isArray(m.content)) return m.content.some((p) => p.type === t);
  return m.type === t;
}

function getModalImageSrc(val) {
  if (!val) return null;
  try {
    if (typeof val === 'string' && /^https?:\/\//i.test(val)) return val;
  } catch (e) {}
  // 否则视为 fileKey，使用客户端代理地址
  try {
    return client.getImageUrl(val);
  } catch (e) {
    return val;
  }
}

// 辅助：将 content 规范化为数组形式
function normalizeContent(c, t) {
  if (Array.isArray(c))
    return c.map((p) => ({ type: String(p.type || 'text'), value: String(p.value || '') }));
  if (t) return [{ type: String(t), value: String(c || '') }];
  return [{ type: 'text', value: String(c || '') }];
}

// 生成用于匹配的签名字符串
function contentSignature(arr) {
  try {
    return arr
      .map((p) => {
        if (p.type === 'text')
          return (
            'text:' +
            String(p.value || '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 200)
          );
        return (
          `${p.type}:` +
          String(p.value || '')
            .trim()
            .slice(0, 200)
        );
      })
      .join('|');
  } catch (e) {
    return String(arr || '');
  }
}

// 试图通过多策略匹配临时消息
function findMatchingTempIndex(serverMsg) {
  const serverArr = normalizeContent(serverMsg.content, serverMsg.type);
  const sig = contentSignature(serverArr);
  for (let i = 0; i < messages.value.length; i++) {
    const m = messages.value[i];
    if (!m || !m.id || !String(m.id).startsWith('temp-')) continue;
    const sameUser =
      m.user &&
      user.value &&
      ((m.user.user_id &&
        user.value.user_id &&
        String(m.user.user_id) === String(user.value.user_id)) ||
        (m.user.id && user.value.id && String(m.user.id) === String(user.value.id)));
    if (!sameUser) continue;
    const localArr = normalizeContent(m.content, m.type);
    if (contentSignature(localArr) === sig) return i;
  }

  for (let i = 0; i < messages.value.length; i++) {
    const m = messages.value[i];
    if (!m || !m.id || !String(m.id).startsWith('temp-')) continue;
    const sameUser =
      m.user &&
      user.value &&
      ((m.user.user_id &&
        user.value.user_id &&
        String(m.user.user_id) === String(user.value.user_id)) ||
        (m.user.id && user.value.id && String(m.user.id) === String(user.value.id)));
    if (!sameUser) continue;
    const localArr = normalizeContent(m.content, m.type);
    const sImg = serverArr.find((p) => p.type === 'image')?.value;
    const lImg = localArr.find((p) => p.type === 'image')?.value;
    if (sImg && lImg && String(sImg) === String(lImg)) return i;

    const sStkr = serverArr.find((p) => p.type === 'sticker')?.value;
    const lStkr = localArr.find((p) => p.type === 'sticker')?.value;
    if (sStkr && lStkr && String(sStkr) === String(lStkr)) return i;

    const sText = serverArr
      .find((p) => p.type === 'text')
      ?.value?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 30);
    const lText = localArr
      .find((p) => p.type === 'text')
      ?.value?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 30);
    if (sText && lText && sText === lText) {
      try {
        const sv = new Date(serverMsg.created_at).getTime();
        const lv = new Date(m.created_at).getTime();
        if (!isNaN(sv) && !isNaN(lv) && Math.abs(sv - lv) <= 30000) return i;
      } catch (e) {
        return i;
      }
    }
  }

  return -1;
}

const onMessage = (msg) => {
  if (!msg || !msg.id) return;

  if (messages.value.some((m) => String(m.id) === String(msg.id))) return;

  const tempIdx = findMatchingTempIndex(msg);
  if (tempIdx !== -1) {
    messages.value.splice(tempIdx, 1, { ...msg, user: msg.user || user.value });
    markChatSeen(String(msg.created_at || '').trim() || new Date().toISOString());
    nextTick(() => scrollToBottom());
    return;
  }

  messages.value.push(msg);
  markChatSeen(String(msg.created_at || '').trim() || new Date().toISOString());
  nextTick(() => scrollToBottom());
};

const onDelete = ({ id }) => {
  messages.value = messages.value.filter((m) => String(m.id) !== String(id));
};

const onAuthError = () => {
  if (authExpiredNotified) return;
  authExpiredNotified = true;
  clearAuthState();
  showToast('登录已过期', 'warning');
};

onMounted(async () => {
  nextTick(() => {
    scheduleFloatingLayoutMeasure();
    bindMessageScrollLock();
  });

  // 首屏先读取本地贴纸缓存，确保下次进入可直接渲染
  hydrateStickerCache();

  window.addEventListener('resize', scheduleFloatingLayoutMeasure);
  window.addEventListener('orientationchange', scheduleFloatingLayoutMeasure);
  window.visualViewport?.addEventListener('resize', scheduleFloatingLayoutMeasure);
  window.visualViewport?.addEventListener('scroll', scheduleFloatingLayoutMeasure);

  const cachedUser = chatUser.value;
  if (cachedUser) user.value = cachedUser;

  client.on('message', onMessage);
  client.on('delete', onDelete);
  client.on('auth_error', onAuthError);

  if (hasToken()) {
    client.setToken(getToken());
    loadingMessages.value = true;
    try {
      await fetchUser();
      await fetchMessages(true);
      client.connectSocket();
    } catch (e) {
      handleApiError(e);
    } finally {
      loadingMessages.value = false;
    }
  } else {
    client.connectSocket();
    await fetchMessages().finally(() => {
      loadingMessages.value = false;
    });
  }

  chatBootstrapFinished.value = true;

  if (typeof ResizeObserver !== 'undefined') {
    floatingLayoutObserver = new ResizeObserver(() => {
      scheduleFloatingLayoutMeasure();
    });
    const headerElement = appHeaderRef.value?.getHeaderElement?.();
    if (headerElement) floatingLayoutObserver.observe(headerElement);
    if (composerShellRef.value) floatingLayoutObserver.observe(composerShellRef.value);
    if (composerInputRowRef.value) floatingLayoutObserver.observe(composerInputRowRef.value);
  }
});

onUnmounted(() => {
  unbindMessageScrollLock();
  window.removeEventListener('resize', scheduleFloatingLayoutMeasure);
  window.removeEventListener('orientationchange', scheduleFloatingLayoutMeasure);
  window.visualViewport?.removeEventListener('resize', scheduleFloatingLayoutMeasure);
  window.visualViewport?.removeEventListener('scroll', scheduleFloatingLayoutMeasure);

  if (layoutMeasureFrame) {
    cancelAnimationFrame(layoutMeasureFrame);
    layoutMeasureFrame = 0;
  }
  if (floatingLayoutObserver) {
    floatingLayoutObserver.disconnect();
    floatingLayoutObserver = null;
  }

  if (scrollObserver) {
    scrollObserver.disconnect();
    scrollObserver = null;
  }
  client.off('message', onMessage);
  client.off('delete', onDelete);
  client.off('auth_error', onAuthError);
  client.disconnectSocket();
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

:deep(.atk-emoticon) {
  display: inline-block;
  vertical-align: middle;
  height: 2.2em;
  margin: 1px 2px;
  cursor: pointer;
}

/* 输入框内的表情包显示 */
:deep(.input-sticker) {
  height: 1.5em !important;
  vertical-align: middle;
  transition: transform 0.2s;
}

/* 兼容深色文字气泡中的表情显示 */
:deep(.message-bubble-target img.atk-emoticon) {
  max-width: 100px;
}

/* 头像渐现效果 */
.avatar-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sticker-input {
  box-sizing: border-box;
  color: var(--text-primary);
}

.sticker-input:empty:before {
  content: attr(placeholder);
  color: var(--input-placeholder-color);
  display: block;
  line-height: inherit;
  pointer-events: none;
}

.chat-nav-action {
  color: var(--text-tertiary);
}

.chat-nav-action:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
}

.chat-composer-input {
  background-color: var(--liquid-chat-input-bg);
  color: var(--text-secondary);
  border: 1px solid var(--liquid-chat-input-border);
  box-shadow:
    inset 0 1px 0 var(--liquid-chat-input-highlight),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: saturate(1.25) blur(14px);
  -webkit-backdrop-filter: saturate(1.25) blur(14px);
}

.chat-composer-input:focus-within {
  background-color: var(--liquid-chat-input-focus-bg);
  border-color: var(--liquid-chat-input-focus-border);
}

.chat-toolbar-action {
  color: var(--text-secondary);
}

.chat-toolbar-action:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
}

.chat-context-item:hover {
  background-color: var(--action-hover-bg);
}

.chat-swipe-indicator {
  background-color: var(--card-soft-bg);
  border: 1px solid var(--card-border);
  color: var(--text-secondary);
}

.chat-alumni-badge {
  background-color: #2563eb;
  border: 2px solid var(--card-bg-strong);
}

.chat-reply-trigger {
  color: var(--text-tertiary);
}

.chat-reply-trigger:hover {
  color: var(--text-primary);
}

.chat-reply-quote {
  color: var(--text-secondary);
}

.chat-reply-quote--peer {
  background-color: var(--chat-reply-quote-bg);
  border-left: 2px solid var(--chat-reply-quote-border);
}

.chat-reply-quote--me {
  background-color: var(--chat-reply-quote-me-bg);
  border-left: 2px solid var(--chat-reply-quote-me-border);
  color: var(--chat-reply-quote-me-text);
}

.chat-bubble-preview {
  background-color: var(--chat-preview-bubble-bg);
  border: 1px dashed var(--chat-preview-bubble-border);
  color: var(--text-secondary);
}

.chat-skeleton-avatar,
.chat-skeleton-line,
.chat-skeleton-bubble,
.theme-skeleton-line {
  background-color: var(--card-soft-bg);
}

.chat-emoji-btn:hover {
  background-color: var(--action-hover-bg);
}

.theme-overlay {
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.chat-close-btn:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
  border-radius: 9999px;
}

.chat-menu-shadow {
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.26);
}

.chat-bubble-peer {
  background-color: var(--chat-bubble-peer-bg);
  border: 1px solid var(--chat-bubble-peer-border);
  color: var(--chat-bubble-peer-text);
}

.chat-bubble-me {
  background: var(--chat-bubble-me-bg);
  border: 1px solid var(--chat-bubble-me-border);
  color: var(--chat-bubble-me-text);
}
</style>
