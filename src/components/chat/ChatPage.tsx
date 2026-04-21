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

import { Sparkles, BookOpen } from "lucide-react";


type ContentType = "TEXT" | "JSONFORLOAD" | "JSONFORMETER" | "MERMAID" | "USER_GUIDE";

interface ChatBotResponse {
  contentType: ContentType;
  content?: string;
  jsonContentMeter?: any[];
  jsonContentLoad?: any[];
  steps?: { text: string; referenceImage?: string }[];
}

type Message = {
  role: "user" | "ai";
  content: string | ChatBotResponse; 
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (data: ChatBotResponse) => {
      setMessages((prev) => [...prev, { role: "ai", content: data }]);
    },
  });

  function handleSend() {
    if (!input.trim() || chatMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    chatMutation.mutate({ prompt: input, conversationId: "user13" });
    setInput("");
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 p-4">
      
      <div className="flex-1 overflow-y-auto space-y-6 pb-28">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";

          return (
            <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              {isUser ? (
                
                <div className="bg-blue-600 text-white p-3 rounded-2xl max-w-[70%] shadow-md">
                  {msg.content as string}
                </div>
              ) : (
                
                <div className="w-full flex flex-col items-start gap-3">
                  {renderAIContent(msg.content as ChatBotResponse)}
                </div>
              )}
            </div>
          );
        })}

        {chatMutation.isPending && (
          <div className="text-gray-500 flex items-center gap-2 italic animate-pulse">
            AI is typing <Spinner />
          </div>
        )}
      </div>

      
      <div className="flex gap-2 pt-4 bg-white sticky bottom-0 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={chatMutation.isPending}
          placeholder="e.g., 'Show site hierarchy' or 'Get meter readings'"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="focus-visible:ring-blue-500"
        />
        <Button onClick={handleSend} disabled={chatMutation.isPending} className="px-6">
          {chatMutation.isPending ? <Spinner /> : <Sparkles className="w-4 h-4 mr-2" />}
          Send
        </Button>
      </div>
    </div>
  );
}



function renderAIContent(response: ChatBotResponse) {
  const { contentType, content, jsonContentMeter, jsonContentLoad, steps } = response;

  switch (contentType) {
    case "TEXT":
      return (
        <div className="bg-white border text-gray-800 p-4 rounded-2xl shadow-sm max-w-[800px] prose prose-blue">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {content || ""}
          </ReactMarkdown>
        </div>
      );

    case "MERMAID":
      return (
        <div className="w-full max-w-[1100px] bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Site Hierarchy</p>
          <ExpandView>
            <MermaidRenderer chart={content || ""} />
          </ExpandView>
        </div>
      );

    case "JSONFORLOAD":
      return (
        <div className="w-full max-w-[1100px]">
          <ExpandView>
            <LoadChartFromData data={jsonContentLoad} />
          </ExpandView>
        </div>
      );

    case "JSONFORMETER":
      return (
        <div className="w-full max-w-[1100px]">
          <ExpandView>
            <MeterChartFromData data={jsonContentMeter} />
          </ExpandView>
        </div>
      );

    case "USER_GUIDE":
      return (
        <div className="bg-white border rounded-2xl shadow-sm max-w-[700px] overflow-hidden">
          <div className="bg-blue-50 p-3 border-b flex items-center gap-2 text-blue-700 font-semibold">
            <BookOpen className="w-4 h-4" /> User Guide
          </div>
          <div className="p-4 space-y-6">
            {steps?.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <div className="space-y-3">
                  <p className="text-gray-700">{step.text}</p>
                  {step.referenceImage && (
                    <img 
                      src={step.referenceImage} 
                      alt={`Step ${i+1}`} 
                      className="rounded-lg border shadow-sm max-w-full h-auto"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="text-red-500 italic">Unknown content format</div>;
  }
}