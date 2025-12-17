<script setup lang="ts">
const props = defineProps<{
  show: boolean
  claimId: number
}>()

const emit = defineEmits(['close', 'success'])

const rating = ref(5)
const comment = ref('')
const isSubmitting = ref(false)
const { toast } = useToast()

async function submitReview() {
  if (rating.value < 1) return
  
  isSubmitting.value = true
  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        claimId: props.claimId,
        score: rating.value,
        comment: comment.value
      }
    })
    
    toast({
      title: '评价成功',
      description: '感谢您的反馈！',
      toast: 'soft-success',
      leading: 'i-ph-check-circle-bold',
      closable: true
    })
    
    emit('success')
    emit('close')
  } catch (e: any) {
    toast({
      title: '评价失败',
      description: e.data?.message || '未知错误',
      toast: 'soft-error',
      leading: 'i-ph-warning-circle-bold',
      closable: true
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <NDialog 
    :open="show"
    title="📝 评价交易体验"
    @update:open="(val) => !val && emit('close')"
  >
    <template #trigger>
      <span />
    </template>
    
    <div class="flex flex-col gap-4 mt-4">
      <div class="flex flex-col gap-2">
        <NLabel>评分</NLabel>
        <div class="flex gap-2">
          <button 
            v-for="i in 5" 
            :key="i"
            type="button"
            class="text-3xl transition-transform hover:scale-110"
            :class="i <= rating ? 'text-orange-400' : 'text-gray-300'"
            @click="rating = i"
          >
            <span :class="i <= rating ? 'i-ph-star-fill' : 'i-ph-star'" />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <NLabel>评价内容</NLabel>
        <NInput 
          v-model="comment"
          type="textarea"
          :rows="3"
          placeholder="写下您对本次交易的感受..."
        />
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <NButton btn="ghost" @click="emit('close')">取消</NButton>
        <NButton 
          btn="solid-primary" 
          :loading="isSubmitting"
          @click="submitReview"
        >
          提交评价
        </NButton>
      </div>
    </template>
  </NDialog>
</template>
