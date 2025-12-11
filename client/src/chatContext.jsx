import React, { createContext, useContext, useState } from "react"
import { Children } from "react"
import { ChatContext } from "./createContext"


export const ChatProvider = ({children}) => {
    const [message, setMessage] = useState([])
    const [isProcessing, setIsProcessing] = useState("")

    const addMessage = (sender, text, audioBase64 = null) => {
        setMessage((prev) => [...prev, {
            sender,
            text, 
            audio:audioBase64
        }])
    }

    return (
        <ChatContext.Provider value={{message, isProcessing, setIsProcessing, addMessage}}>
            {children}
        </ChatContext.Provider>
    )
}

