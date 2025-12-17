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
      toast: 'soft-yellow',
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
      toast: 'soft-red',
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
      <div class="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-4">
        <span class="i-ph-user-circle text-4xl" />
      </div>
      <h1 class="text-2xl font-bold">欢迎回来</h1>
      <p class="text-muted-foreground">登录您的账号以继续</p>
    </div>
    
    <UCard>
      <template #content>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormGroup label="邮箱" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="name@example.com"
              leading="i-ph-envelope"
            />
          </UFormGroup>

          <UFormGroup label="密码" required>
            <template #hint>
              <NuxtLink to="#" class="text-xs text-primary hover:underline">忘记密码?</NuxtLink>
            </template>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              leading="i-ph-lock"
            />
          </UFormGroup>

          <UButton
            type="submit"
            :loading="isSubmitting"
            class="w-full mt-2"
            size="lg"
          >
            登录
          </UButton>
        </form>

        <div class="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          还没有账号？
          <NuxtLink to="/register" class="text-primary font-medium hover:underline">立即注册</NuxtLink>
        </div>
      </template>
    </UCard>
  </div>
</template>
