
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";

interface ChatMessageProps {
  text: string;
  language: string;
  onSummarize: () => Promise<void>;
  onTranslate: (lang: string) => Promise<void>;
  summary?: string;
  translation?: string;
  isSummarizing?: boolean; // Separate state for summarizing
  isTranslating?: boolean; // Separate state for translating
}


const languages = [
  { value: "en", label: "English" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
  { value: "ru", label: "Russian" },
  { value: "tr", label: "Turkish" },
  { value: "fr", label: "French" },
];

export function ChatMessage({
  text,
  language,
  onSummarize,
  onTranslate,
  summary,
  translation,
  isSummarizing,
  isTranslating
}: ChatMessageProps) {
  const [selectedLang, setSelectedLang] = useState("");
  const shouldShowSummarize = text.length > 150 && language === "en";

  return (
    <div className="message-enter glass-card rounded-lg p-4 space-y-3">
      <p className="text-base leading-relaxed">{text}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary">
          Language: {language.toUpperCase()}
        </Badge>
        {shouldShowSummarize && (
  <Button
    variant="outline"
    size="sm"
    onClick={onSummarize}
    disabled={isSummarizing} // Use isSummarizing instead
  >
    {isSummarizing ? "Summarizing..." : "Summarize"}
  </Button>
)}
        <div className="flex items-center gap-2">
          <Select
            value={selectedLang}
            onValueChange={(value) => setSelectedLang(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
  variant="outline"
  size="sm"
  onClick={() => selectedLang && onTranslate(selectedLang)}
  disabled={!selectedLang || isTranslating} // Use isTranslating instead
>
  {isTranslating ? "Translating..." : "Translate"}
</Button>
        </div>
      </div>
      {summary && (
        <div className="mt-4 p-3 bg-secondary rounded-md">
          <p className="text-sm font-medium mb-1">Summary:</p>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      )}
      {translation && (
        <div className="mt-4 p-3 bg-secondary rounded-md">
          <p className="text-sm font-medium mb-1">Translation:</p>
          <p className="text-sm text-muted-foreground">{translation}</p>
        </div>
      )}
    </div>
  );
}
