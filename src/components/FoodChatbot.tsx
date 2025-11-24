
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

export default function FoodChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
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
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/nutrition-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }]
                }),
            });

            const data = await response.json();
            const aiContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't get the nutrition info.";

            setMessages(prev => [...prev, { role: "assistant", content: aiContent }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Error fetching data." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 bg-zinc-900 text-white flex justify-between items-center">
                        <h3 className="font-bold text-sm">Nutrition AI (Gemini Mini)</h3>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
                        {messages.length === 0 && (
                            <p className="text-center text-xs text-zinc-400 mt-10">
                                Ask for food nutrition.<br />Example: "Boiled Egg"
                            </p>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-xl p-3 text-sm whitespace-pre-wrap ${msg.role === "user"
                                            ? "bg-zinc-900 text-white rounded-br-none"
                                            : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-zinc-200 rounded-xl p-3 rounded-bl-none shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-zinc-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type food name..."
                            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400 text-zinc-900"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            >
                {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
            </button>
        </div>
    );
}
