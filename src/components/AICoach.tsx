"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AICoach() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                setMessages((prev) => [...prev, data.choices[0].message]);
            }
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-zinc-400 mt-20">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium text-zinc-900">Hello! I'm your AI Coach.</p>
                        <p className="text-sm">Ask me about your diet, workout, or progress.</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-zinc-900" : "bg-zinc-100 border border-zinc-200"
                                }`}
                        >
                            {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-zinc-900" />}
                        </div>

                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === "user"
                                ? "bg-zinc-900 text-white rounded-tr-none"
                                : "bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-tl-none"
                                }`}
                        >
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-zinc-900" />
                        </div>
                        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-2xl rounded-tl-none text-sm text-zinc-500">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your coach..."
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-zinc-200 outline-none text-zinc-900"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
