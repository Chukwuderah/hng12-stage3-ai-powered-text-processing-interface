
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { useState } from "react";
import SetupModal from "@/components/SetupModal";

interface Message {
  id: string;
  text: string;
  language: string;
  summary?: string;
  translation?: string;
  isSummarizing?: boolean;
  isTranslating?: boolean;
}

declare global {
  interface Window {
    ai?: {
      languageDetector?: {
        capabilities: () => Promise<{
          available: "readily" | "after-download" | "not-available";
        }>;
        create: () => Promise<{
          detect: (text: string) => Promise<{ detectedLanguage: string }[]>;
        }>;
      };
      translator?: {
        capabilities: () => Promise<{
          languagePairAvailable: (source: string, target: string) => "no" | "readily" | "after-download";
        }>;
        create: (options: {
          sourceLanguage: string;
          targetLanguage: string;
          monitor?: (m: EventTarget) => void;
        }) => Promise<{
          translate: (text: string) => Promise<string>;
          ready: Promise<void>;
        }>;
      };
      summarizer?: {
        capabilities: () => Promise<{
          available: "readily" | "after-download" | "no";
        }>;
        create: (options: {
          sharedContext?: string;
          type?: "key-points" | "tl;dr" | "teaser" | "headline";
          format?: "markdown" | "plain-text";
          length?: "short" | "medium" | "long";
          monitor?: (m: EventTarget) => void;
        }) => Promise<{
          summarize: (text: string, context?: { context: string }) => Promise<string>;
          ready: Promise<void>;
        }>;
      };
    };
  }
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();


  const detectLanguage = async (text: string): Promise<string> => {
    try {
      console.log(window.ai);
      if (window.ai?.languageDetector) {
        const detector = await window.ai.languageDetector.create();
        const results = await detector.detect(text);
  
        if (results.length > 0) {
          return results[0].detectedLanguage; // Return the detected language code
        } else {
          throw new Error("No language detected");
        }
      } else {
        throw new Error("Language Detector API is not supported.");
      }
    } catch (error) {
      console.error("Language detection failed:", error);
      toast({
        title: "Error",
        description: "Failed to detect language. Please try again.",
        variant: "destructive",
      });
      return "unknown";
    }
  };

  const handleSend = async (text: string) => {
    setLoading(true);
    try {
      const language = await detectLanguage(text);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text, language },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isSummarizing: true } : msg
      )
    );
  
    try {
      if (!window.ai?.summarizer) {
        throw new Error("Chrome AI Summarizer API is not available.");
      }
  
      const message = messages.find((msg) => msg.id === messageId);
      if (!message) {
        throw new Error("Message not found.");
      }
  
      const capabilities = await window.ai.summarizer.capabilities();
      console.log("Summarizer Capabilities:", capabilities);
      if (capabilities.available === "no") {
        throw new Error("Summarization is not available.");
      }
  
      let summarizer;
      if (capabilities.available === "after-download") {
        console.log("Downloading summarization model...");
        summarizer = await window.ai.summarizer.create({
          type: "key-points",
          format: "markdown",
          length: "medium",
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              const percentage = ((e.loaded / e.total) * 100).toFixed(2);
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes (${percentage}%).`);
            });
          }
        });
        await summarizer.ready;
        console.log("Summarization model is ready.");
      } else {
        summarizer = await window.ai.summarizer.create({
          type: "key-points",
          format: "markdown",
          length: "medium",
        });
      }
  
      const summary = await summarizer.summarize(message.text, {
        context: "This text is being summarized for clarity and brevity."
      });
  
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, summary, isSummarizing: false } : msg
        )
      );
    } catch (error) {
      console.error("Summarization error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isSummarizing: false } : msg
        )
      );
    }
  };
  
  

  const handleTranslate = async (messageId: string, targetLang: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTranslating: true } : msg
      )
    );
  
    try {
      if (!window.ai?.translator) {
        throw new Error("Chrome AI Translator API is not available.");
      }
  
      const message = messages.find((msg) => msg.id === messageId);
      if (!message) {
        throw new Error("Message not found.");
      }
  
      const capabilities = await window.ai.translator.capabilities();
      const availability = await capabilities.languagePairAvailable(message.language, targetLang);
  
      console.log("Translator Capabilities:", capabilities);
      console.log("Availability for", message.language, "→", targetLang, ":", availability);
  
      if (availability === "no") {
        throw new Error(`Translation not available for ${message.language} → ${targetLang}`);
      }
  
      let translator;
      if (availability === "after-download") {
        console.log(`Downloading translation model for ${message.language} → ${targetLang}...`);
  
        translator = await window.ai.translator.create({
          sourceLanguage: message.language,
          targetLanguage: targetLang,
          monitor: (monitor) => {
            console.log("Monitor function attached:", monitor);
            
            if ("ondownloadprogress" in monitor) {
              monitor.ondownloadprogress = (e: any) => {
                console.log(`Download Progress: ${e.loaded} of ${e.total} bytes.`);
              };
            } else {
              console.log("ondownloadprogress property not available, using addEventListener...");
              monitor.addEventListener("downloadprogress", (e: any) => {
                console.log(`Download Progress: ${e.loaded} of ${e.total} bytes.`);
              });
            }
  
            monitor.addEventListener("error", (e: any) => {
              console.error("Download error:", e);
            });
          },
        });
  
        console.log("Waiting for translator to be ready...");
        await translator.ready;
        console.log("Translation model is ready.");
      } else {
        translator = await window.ai.translator.create({
          sourceLanguage: message.language,
          targetLanguage: targetLang,
        });
      }
  
      console.log("Performing translation...");
      const translation = await translator.translate(message.text);
      console.log("Translation result:", translation);
  
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, translation, isTranslating: false } : msg
        )
      );
    } catch (error) {
      console.error("Translation error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isTranslating: false } : msg
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SetupModal />
      <main className="pt-4 chat-container">
        {messages.map((message) => (
          <ChatMessage
          key={message.id}
          text={message.text}
          language={message.language}
          summary={message.summary}
          translation={message.translation}
          onSummarize={() => handleSummarize(message.id)}
          onTranslate={(lang) => handleTranslate(message.id, lang)}
          isSummarizing={message.isSummarizing} // Separate state for summarization
          isTranslating={message.isTranslating} // Separate state for translation
        />
        ))}
      </main>
      <ChatInput onSend={handleSend} isLoading={loading} />
    </div>
  );
};

export default Index;
