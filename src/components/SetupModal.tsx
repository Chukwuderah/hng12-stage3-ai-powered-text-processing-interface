import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SetupModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenSetupModal");
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenSetupModal", "true");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📢 Set Up Your System for AI Features</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>To use summarization, translation, and language detection, follow these steps:</p>
          <ul className="list-disc space-y-2 text-sm">
            <li className="ml-4">
              Install <a href="https://www.google.com/chrome/canary/" target="_blank" className="text-blue-600 underline">Chrome Canary</a> for experimental AI features.
            </li>
            <li className="ml-4">
              Go to <code>chrome://flags</code> and enable:
              <ul className="list-disc mt-2">
                <li className="ml-8"><code>#summarization-api-for-gemini-nano</code></li>
                <li className="ml-8"><code>#optimization-guide-on-device-model</code> → Set to <b>Enabled ByPassPerfRequirement</b></li>
                <li className="ml-8"><code>#translation-api</code> → Set to <b>Enabled Without Language Pack Limit</b></li>
                <li className="ml-8"><code>#language-detection-api</code></li>
              </ul>
            </li>
            <li className="ml-4">
              Check available space: You need at least <b>7GB</b> free.
            </li>
            <li className="ml-4">
              Open <code>chrome://components</code> and update:
              <ul className="list-disc mt-2">
                <li className="ml-8"><b>Optimization Guide On Device Model</b> (If version is <code>0.0.0.0</code>, click "Update")</li>
              </ul>
            </li>
            <li className="ml-4">
              AI Models will download then.
            </li>
          </ul>
        </div>
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClose}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetupModal;