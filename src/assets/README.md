# Assets 资源文件夹

此文件夹用于存放项目的静态资源文件。

## 目录结构

- `images/` - 存放图片资源（如 .png, .jpg, .svg 等）

## 使用方式

在 Vue 组件中引用图片资源：

```vue
<template>
  <img :src="loginImage" alt="登录" />
</template>

<script setup>
import loginImage from '@/assets/images/login-bg.jpg'
</script>
```

或者使用动态路径：

```vue
<template>
  <img src="@/assets/images/login-bg.jpg" alt="登录" />
</template>
```

