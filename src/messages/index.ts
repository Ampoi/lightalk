type Sender = "communication partner" | "me"

export type Message = {
  sender: Sender
  content: string
}

export const messages: Message[] = []