<template>
  <main class="w-screen h-screen bg-slate-300 flex flex-row">
    <div ref="senderCanvas"/>
    <div class="p-4 flex flex-col gap-4 basis-2/3">
      <div ref="receiverCanvas"/>
      <div>
        <button @click="() => send('hello world')">send</button>
        <button @click="setRectDefault">defaultRect</button>
      </div>
      <div>
        {{message}}
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import p5 from 'p5';
import { sender, send } from './sender';
import { receiver, setRectDefault, message } from './receiver';

const senderCanvas = ref<HTMLCanvasElement>()
const receiverCanvas = ref<HTMLCanvasElement>()

onMounted(() => {
  if( !senderCanvas.value ) throw new Error("Canvas not found")

  new p5(sender, senderCanvas.value)
  new p5(receiver, receiverCanvas.value)
})
</script>