<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface LightboxPayload {
  src: string
  alt?: string
  caption?: string
}

const isOpen = ref(false)
const activeImage = ref<LightboxPayload>({ src: '' })

function openLightbox(payload: LightboxPayload) {
  if (!payload.src) return
  activeImage.value = payload
  isOpen.value = true
}

function closeLightbox() {
  isOpen.value = false
}

function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target) return
  if (target.tagName === 'IMG') {
    const img = target as HTMLImageElement
    if (img.classList.contains('no-lightbox')) return
    const insideDoc = img.closest('.vp-doc') || img.hasAttribute('data-lightbox')
    if (!insideDoc) return

    const figCaption = img.closest('figure')?.querySelector('figcaption')?.textContent?.trim()
    const caption =
      img.getAttribute('data-caption') ||
      figCaption ||
      img.getAttribute('title') ||
      img.getAttribute('alt') ||
      ''

    openLightbox({
      src: img.currentSrc || img.src,
      alt: img.alt || '证据截图',
      caption,
    })
  }
}

function handleCustomLightbox(e: Event) {
  const custom = e as CustomEvent<LightboxPayload>
  if (custom.detail?.src) {
    openLightbox(custom.detail)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    closeLightbox()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('dpz:lightbox', handleCustomLightbox)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('dpz:lightbox', handleCustomLightbox)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="dpz-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="证据图片放大预览"
      @click.self="closeLightbox"
    >
      <div class="dpz-lightbox__frame">
        <button
          type="button"
          class="dpz-lightbox__close"
          aria-label="关闭图片预览 (Esc)"
          @click="closeLightbox"
        >
          关闭 (Esc) ×
        </button>
        <img
          :src="activeImage.src"
          :alt="activeImage.alt || '放大图片'"
          class="dpz-lightbox__img no-lightbox"
        />
        <div v-if="activeImage.alt || activeImage.caption" class="dpz-lightbox__meta">
          <div v-if="activeImage.alt" class="dpz-lightbox__alt">{{ activeImage.alt }}</div>
          <div v-if="activeImage.caption && activeImage.caption !== activeImage.alt" class="dpz-lightbox__caption">
            来源与说明：{{ activeImage.caption }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dpz-lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(20, 29, 38, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dpz-lightbox__frame {
  position: relative;
  max-width: 94vw;
  max-height: 92vh;
  background: var(--dpz-surface);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4);
}

.dpz-lightbox__close {
  align-self: flex-end;
  border: 1px solid var(--dpz-border-strong);
  background: var(--dpz-bg);
  color: var(--dpz-ink);
  font-size: 13px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.dpz-lightbox__close:hover {
  background: var(--dpz-accent);
  color: #FFFFFF;
  border-color: var(--dpz-accent);
}

.dpz-lightbox__img {
  max-width: 88vw;
  max-height: 74vh;
  object-fit: contain;
  border-radius: 6px;
  background: #141D26;
}

.dpz-lightbox__meta {
  border-top: 1px solid var(--dpz-border);
  padding-top: 8px;
  font-size: 13.5px;
  color: var(--dpz-text);
}

.dpz-lightbox__alt {
  font-weight: 600;
  color: var(--dpz-ink);
}

.dpz-lightbox__caption {
  font-size: 12.5px;
  color: var(--dpz-text-muted);
  margin-top: 2px;
}
</style>
