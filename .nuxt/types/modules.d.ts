import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ["unocss"]?: ModuleDependencyMeta<typeof import("@unocss/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@nuxtjs/color-mode"]?: ModuleDependencyMeta<typeof import("@nuxtjs/color-mode").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["vueuse"]?: ModuleDependencyMeta<typeof import("@vueuse/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@reka-ui/nuxt"]?: ModuleDependencyMeta<typeof import("reka-ui/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["vee-validate"]?: ModuleDependencyMeta<typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@una-ui/nuxt"]?: ModuleDependencyMeta<typeof import("@una-ui/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["auth-utils"]?: ModuleDependencyMeta<typeof import("nuxt-auth-utils").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
  }
  interface NuxtOptions {
    /**
     * Configuration for `@unocss/nuxt`
     */
    ["unocss"]: typeof import("@unocss/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@nuxtjs/color-mode`
     */
    ["colorMode"]: typeof import("@nuxtjs/color-mode").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@vueuse/nuxt`
     */
    ["vueuse"]: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `reka-ui/nuxt`
     */
    ["reka"]: typeof import("reka-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@vee-validate/nuxt`
     */
    ["veeValidate"]: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@una-ui/nuxt`
     */
    ["una"]: typeof import("@una-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `nuxt-auth-utils`
     */
    ["auth"]: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
  }
  interface NuxtConfig {
    /**
     * Configuration for `@unocss/nuxt`
     */
    ["unocss"]?: typeof import("@unocss/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@nuxtjs/color-mode`
     */
    ["colorMode"]?: typeof import("@nuxtjs/color-mode").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@vueuse/nuxt`
     */
    ["vueuse"]?: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `reka-ui/nuxt`
     */
    ["reka"]?: typeof import("reka-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@vee-validate/nuxt`
     */
    ["veeValidate"]?: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@una-ui/nuxt`
     */
    ["una"]?: typeof import("@una-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `nuxt-auth-utils`
     */
    ["auth"]?: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@unocss/nuxt/dist/index.mjs", Exclude<NuxtConfig["unocss"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@nuxtjs/color-mode/dist/module.mjs", Exclude<NuxtConfig["colorMode"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@vueuse/nuxt/index.mjs", Exclude<NuxtConfig["vueuse"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/reka-ui/dist/nuxt/index.mjs", Exclude<NuxtConfig["reka"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@vee-validate/nuxt/dist/module.mjs", Exclude<NuxtConfig["veeValidate"], boolean>] | ["@una-ui/nuxt", Exclude<NuxtConfig["una"], boolean>] | ["nuxt-auth-utils", Exclude<NuxtConfig["auth"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ["unocss"]?: ModuleDependencyMeta<typeof import("@unocss/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@nuxtjs/color-mode"]?: ModuleDependencyMeta<typeof import("@nuxtjs/color-mode").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["vueuse"]?: ModuleDependencyMeta<typeof import("@vueuse/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@reka-ui/nuxt"]?: ModuleDependencyMeta<typeof import("reka-ui/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["vee-validate"]?: ModuleDependencyMeta<typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@una-ui/nuxt"]?: ModuleDependencyMeta<typeof import("@una-ui/nuxt").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["auth-utils"]?: ModuleDependencyMeta<typeof import("nuxt-auth-utils").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O : Record<string, unknown>>
  }
  interface NuxtOptions {
    /**
     * Configuration for `@unocss/nuxt`
     */
    ["unocss"]: typeof import("@unocss/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@nuxtjs/color-mode`
     */
    ["colorMode"]: typeof import("@nuxtjs/color-mode").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@vueuse/nuxt`
     */
    ["vueuse"]: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `reka-ui/nuxt`
     */
    ["reka"]: typeof import("reka-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@vee-validate/nuxt`
     */
    ["veeValidate"]: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@una-ui/nuxt`
     * @see https://www.npmjs.com/package/@una-ui/nuxt
     */
    ["una"]: typeof import("@una-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `nuxt-auth-utils`
     * @see https://www.npmjs.com/package/nuxt-auth-utils
     */
    ["auth"]: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O : Record<string, any>
  }
  interface NuxtConfig {
    /**
     * Configuration for `@unocss/nuxt`
     */
    ["unocss"]?: typeof import("@unocss/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@nuxtjs/color-mode`
     */
    ["colorMode"]?: typeof import("@nuxtjs/color-mode").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@vueuse/nuxt`
     */
    ["vueuse"]?: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `reka-ui/nuxt`
     */
    ["reka"]?: typeof import("reka-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@vee-validate/nuxt`
     */
    ["veeValidate"]?: typeof import("@vee-validate/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@una-ui/nuxt`
     * @see https://www.npmjs.com/package/@una-ui/nuxt
     */
    ["una"]?: typeof import("@una-ui/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `nuxt-auth-utils`
     * @see https://www.npmjs.com/package/nuxt-auth-utils
     */
    ["auth"]?: typeof import("nuxt-auth-utils").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> : Record<string, any>
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@unocss/nuxt/dist/index.mjs", Exclude<NuxtConfig["unocss"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@nuxtjs/color-mode/dist/module.mjs", Exclude<NuxtConfig["colorMode"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@vueuse/nuxt/index.mjs", Exclude<NuxtConfig["vueuse"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/reka-ui/dist/nuxt/index.mjs", Exclude<NuxtConfig["reka"], boolean>] | ["file:///home/louis/lost-and-found-platform-new/node_modules/@vee-validate/nuxt/dist/module.mjs", Exclude<NuxtConfig["veeValidate"], boolean>] | ["@una-ui/nuxt", Exclude<NuxtConfig["una"], boolean>] | ["nuxt-auth-utils", Exclude<NuxtConfig["auth"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
}