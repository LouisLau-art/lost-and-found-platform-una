<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const form = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)
const { toast } = useToast()

async function handleSubmit() {
  if (!form.value.name || !form.value.username || !form.value.email || !form.value.password) {
    toast({ 
      title: '请填写所有必填项', 
      toast: 'soft-warning',
      leading: 'i-ph-warning-bold',
      closable: true 
    })
    return
  }

  if (form.value.password.length < 6) {
    toast({ 
      title: '密码至少需要6个字符', 
      toast: 'soft-warning',
      leading: 'i-ph-warning-bold',
      closable: true 
    })
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    toast({ 
      title: '两次输入的密码不一致', 
      toast: 'soft-warning',
      leading: 'i-ph-warning-bold',
      closable: true
    })
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.value.name,
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
      },
    })
    toast({ 
      title: '注册成功', 
      toast: 'soft-success',
      leading: 'i-ph-check-circle-bold',
      closable: true
    })
    window.location.href = '/'
  } catch (e: any) {
    toast({ 
      title: '注册失败', 
      description: e.data?.message || '请检查输入信息', 
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
        <span class="i-ph-rocket-launch text-4xl" />
      </div>
      <h1 class="text-2xl font-bold">创建账号</h1>
      <p class="opacity-70">加入校园失物招领平台</p>
    </div>
    
    <NCard card="outline" class="shadow-xl">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <NLabel for="name">姓名 <span class="text-red-500">*</span></NLabel>
            <NInput 
              id="name"
              v-model="form.name" 
              type="text" 
              placeholder="真实姓名" 
            />
          </div>
          <div class="space-y-2">
            <NLabel for="username">用户名 <span class="text-red-500">*</span></NLabel>
            <NInput 
              id="username"
              v-model="form.username" 
              type="text" 
              placeholder="username" 
            />
          </div>
        </div>

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
          <NLabel for="password">密码 <span class="text-red-500">*</span></NLabel>
          <NInput 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="至少6位" 
            leading="i-ph-lock"
          />
        </div>

        <div class="space-y-2">
          <NLabel for="confirmPassword">确认密码 <span class="text-red-500">*</span></NLabel>
          <NInput 
            id="confirmPassword"
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="重复密码" 
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
          注册
        </NButton>
      </form>

      <template #footer>
        <div class="text-center text-sm opacity-70 pt-4 border-t border-$c-divider">
          已有账号？
          <NuxtLink to="/login" class="text-$c-primary font-medium hover:underline">立即登录</NuxtLink>
        </div>
      </template>
    </NCard>
  </div>
</template>
