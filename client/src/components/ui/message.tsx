import type { ComponentProps, HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

// ------------------------------------------------------------------
// MESSAGE WRAPPER
// ------------------------------------------------------------------
export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant"
}

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    data-role={from}
    className={cn(
      "group flex w-full items-start gap-3 py-2",
      // Align User to right, Assistant to left
      from === "user" ? "justify-end" : "justify-start",
      className
    )}
    {...props}
  />
)

// ------------------------------------------------------------------
// MESSAGE CONTENT (The Bubble)
// ------------------------------------------------------------------
const messageContentVariants = cva(
  // Base styles:
  // w-fit: shrinks width to match text content
  // whitespace-pre-wrap: ensures text wraps to next line
  // break-words: prevents long words from overflowing
  "relative flex flex-col gap-2 rounded-2xl px-2 py-3 text-sm shadow-sm w-fit max-w-[70%] break-words whitespace-pre-wrap",
  {
    variants: {
      variant: {
        contained: [
          // USER STYLES (White bubble, Black text)
          "group-data-[role=user]:bg-white group-data-[role=user]:text-black group-data-[role=user]:rounded-br-none group-data-[role=user]:border-none",
          
          // ASSISTANT STYLES (Dark bubble, White text)
          "group-data-[role=assistant]:bg-[#27272a] group-data-[role=assistant]:text-white group-data-[role=assistant]:rounded-tl-none group-data-[role=assistant]:border-none",
        ],
        flat: [
          "bg-transparent px-0 py-0",
          "group-data-[role=user]:text-foreground",
          "group-data-[role=assistant]:text-foreground",
        ],
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  }
)

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}
  >
    {children}
  </div>
)

// ------------------------------------------------------------------
// MESSAGE AVATAR
// ------------------------------------------------------------------
export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string
  name?: string
}

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn("size-8 ring-1 ring-border shrink-0", className)} {...props}>
    <AvatarImage alt="Avatar" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "AI"}</AvatarFallback>
  </Avatar>
)