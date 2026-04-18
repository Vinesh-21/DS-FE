import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { sendChat } from "@/services/ai.api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/Spinner";

import MermaidRenderer from "./MermaidRenderer";
import ExpandView from "@/components/ui/ExpandView";

import { LoadChartFromData } from "./LoadChartFromData";
import { MeterChartFromData } from "./MeterChartFromData";

import { Sparkles } from "lucide-react";

/* ================= TYPES ================= */

type Message = {
  role: "user" | "ai";
  content: any;
};

/* ================= HELPERS ================= */

function tryParseJSON(content: any) {
  console.log(content)
  console.log(typeof(content))
  if (typeof content !== "string") return content;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function detectDataType(data: any) {
  if (!Array.isArray(data) || data.length === 0) return null;

  if ("power" in data[0]) return "load";
  if ("reading" in data[0]) return "meter";

  return null;
}



export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data },
      ]);
    },
  });

  function handleSend() {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
    ]);

    chatMutation.mutate({
      prompt: input,
      conversationId: "user13",
    });

    setInput("");
  }

  return (
    <div className="h-screen flex flex-col p-4">
      
      <div className="flex-1 overflow-y-scroll space-y-4 pb-28">
        {messages.map((msg, idx) => {
          const parsed = tryParseJSON(msg.content);
          const type = detectDataType(parsed);

          return (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              
              {msg.role === "user" && (
                <div className="bg-blue-500 text-white p-3 rounded-2xl max-w-[70%] shadow-sm">
                  {msg.content}
                </div>
              )}

              
              {msg.role === "ai" && (
                <div className="w-full flex flex-col items-start">
                  
                  {type === "load" && (
                    <div className="w-full flex justify-center my-4">
                      <div className="w-full max-w-[1100px]">
                        <ExpandView>
                          <LoadChartFromData data={parsed} />
                        </ExpandView>
                      </div>
                    </div>
                  )}

              
                  {type === "meter" && (
                    <div className="w-full flex justify-center my-4">
                      <div className="w-full max-w-[1100px]">
                        <ExpandView>
                          <MeterChartFromData data={parsed} />
                        </ExpandView>
                      </div>
                    </div>
                  )}

                  {!type && (
                    <div className="bg-gray-200 text-black p-3 rounded-2xl shadow-sm max-w-[600px] w-full">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code({ className, children }) {
                            const text = String(children).trim();

                            if (
                              className?.includes("language-mermaid") ||
                              text.startsWith("graph")
                            ) {
                              return (
                                <div className="w-full flex justify-center my-4">
                                  <div className="w-full max-w-[1000px] min-h-[200px]">
                                    <ExpandView>
                                      <MermaidRenderer chart={text} />
                                    </ExpandView>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <pre className="bg-black text-white p-2 rounded overflow-x-auto">
                                <code>{text}</code>
                              </pre>
                            );
                          },
                        }}
                      >
                        {String(msg.content)}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ================= LOADING ================= */}
        {chatMutation.isPending && (
          <div className="text-gray-500 flex items-center gap-2">
            AI is typing <Spinner />
          </div>
        )}
      </div>

      {/* ================= INPUT ================= */}
      <div className="flex gap-2 pt-2 bg-white sticky bottom-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={chatMutation.isPending}
          className={
            chatMutation.isPending
              ? "border-4 shadow-blue-400 border-blue-300 animate-pulse"
              : ""
          }
          placeholder="Ask something..."
          onKeyDown={(e) =>
            e.key === "Enter" && handleSend()
          }
        />

        <Button
          onClick={handleSend}
          disabled={chatMutation.isPending}
          className="group flex items-center gap-2"
        >
          {chatMutation.isPending ? (
            <>
              Generating <Spinner />
            </>
          ) : (
            <>
              Send
              <Sparkles className="transition-all duration-300 group-hover:rotate-12 group-hover:scale-125 group-hover:text-yellow-400" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}