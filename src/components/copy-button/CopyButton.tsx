import { useState } from "react";

import Button from "../button/Button";

import FileCopyIcon from "../../icons/file-copy.svg?react";
import CheckIcon from "../../icons/check.svg?react";

interface CopyButtonProps {
  spec: string;
}

const CopyButton = ({ spec }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  function handleCopyConfig() {
    try {
      navigator.clipboard.writeText(spec);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      void 0;
    }
  }

  const Icon = copied ? CheckIcon : FileCopyIcon;

  return (
    <Button variant="ghost" onClick={handleCopyConfig}>
      <Icon /> Copy configuration
    </Button>
  );
};

export default CopyButton;
