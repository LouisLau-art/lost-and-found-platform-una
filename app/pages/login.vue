<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const form = ref({
  email: '',
  password: '',
})

const isSubmitting = ref(false)
const { toast } = useToast()

async function handleSubmit() {
  if (!form.value.email || !form.value.password) {
    toast({ 
      title: '请填写邮箱和密码', 
      toast: 'soft-warning',
      leading: 'i-ph-warning-bold',
      closable: true 
    })
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value,
    })
    toast({ 
      title: '登录成功', 
      toast: 'soft-success',
      leading: 'i-ph-check-circle-bold',
      closable: true 
    })
    window.location.href = '/'
  } catch (e: any) {
    toast({ 
      title: '登录失败', 
      description: e.data?.message || '账号或密码错误', 
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
  <div class="max-w-md mx-auto py-12">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center p-4 rounded-full bg-$c-primary/10 text-$c-primary mb-4">
        <span class="i-ph-user-circle text-4xl" />
      </div>
      <h1 class="text-2xl font-bold">欢迎回来</h1>
      <p class="opacity-70">登录您的账号以继续</p>
    </div>
    
    <NCard card="outline" class="shadow-xl">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <NLabel for="email">邮箱 <span class="text-red-500">*</span></NLabel>
          <NInput 
            id="email"
            v-model="form.email" 
            type="email" 
            placeholder="name@example.com" 
            leading="i-ph-envelope"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <NLabel for="password">密码 <span class="text-red-500">*</span></NLabel>
            <NuxtLink to="#" class="text-xs text-$c-primary hover:underline">忘记密码?</NuxtLink>
          </div>
          <NInput 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="••••••••" 
            leading="i-ph-lock"
          />
        </div>

        <NButton 
          type="submit" 
          btn="solid-primary"
          block
          size="lg"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          class="mt-4"
        >
          登录
        </NButton>
      </form>

      <template #footer>
        <div class="text-center text-sm opacity-70 pt-4 border-t border-$c-divider">
          还没有账号？
          <NuxtLink to="/register" class="text-$c-primary font-medium hover:underline">立即注册</NuxtLink>
        </div>
      </template>
    </NCard>
  </div>
</template>
