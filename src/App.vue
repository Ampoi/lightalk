<template>
  <main class="w-screen h-screen bg-zinc-100 flex flex-row">
    <div ref="senderCanvas"/>
    <div class="p-4 flex flex-col gap-4 basis-2/3">
      <div>
        <button @click="setRectDefault">defaultRect</button>
      </div>
      <div ref="receiverCanvas"/>
      <div class="grow flex flex-col gap-4 overflow-scroll">
        <Message
          v-for="message in messages"
          :message/>
        <Message
          v-if="receivingText"
          class="opacity-60"
          :message="{
            sender: 'communication partner',
            content: receivingText
          }"/>
      </div>
      <div class="bg-white border-[1px] border-zinc-300 rounded-xl flex flex-row gap-2 items-center pr-2">
        <input
          type="text"
          placeholder="メッセージを入力..."
          v-model="sendMessage"
          class="p-4 pr-0 grow outline-none bg-transparent">
        <button
          @click="onSendButtonClicked"
          class="bg-orange-500 rounded-full text-white font-semibold py-2 px-4">send</button>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import p5 from 'p5';
import { sender, send } from './sender';
import { receiver, setRectDefault, receivingText } from './receiver';
import { messages } from "./messages"
import Message from "./components/message.vue"

const sendMessage = ref<string>('')
const onSendButtonClicked = async () => {
  const message = sendMessage.value
  sendMessage.value = ''
  await send(message)
  messages.push({
    sender: "me",
    content: message
  })
}

const senderCanvas = ref<HTMLCanvasElement>()
const receiverCanvas = ref<HTMLCanvasElement>()

onMounted(() => {
  if( !senderCanvas.value ) throw new Error("Canvas not found")

  new p5(sender, senderCanvas.value)
  new p5(receiver, receiverCanvas.value)
})
</script>