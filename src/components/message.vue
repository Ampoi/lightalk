<template>
  <div
    class="flex items-center gap-2"
    :class="message.sender == 'me' ? 'flex-row-reverse' : 'flex-row'">
    <div class="basis-6">
      <Avatar
        variant="beam"
        :size="32"
        :name="message.sender"
        :colors="['#fb6900', '#f63700', '#004853', '#007e80', '#00b9bd']"/>
    </div>
    <p
      class="grow"
      :class="{
        'text-right': message.sender == 'me',
      }">{{ message.content }}</p>
  </div>
</template>
<script setup lang="ts">
import Avatar from "vue-boring-avatars"
import { Message } from "../messages"

defineProps<{
  message: Message
}>()
</script>