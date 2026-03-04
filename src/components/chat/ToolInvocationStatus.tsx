import { Loader2 } from "lucide-react";

interface ToolInvocationStatusProps {
  toolInvocation: {
    toolName: string;
    state: string;
    args: unknown;
    result?: unknown;
  };
}

function basename(filePath: string): string {
  return filePath.split("/").pop() || filePath;
}

export function getToolLabel(
  toolName: string,
  args: unknown,
  isComplete: boolean
): { text: string; fullPath?: string } {
  if (!args || typeof args !== "object") {
    return { text: toolName };
  }

  const argsObj = args as Record<string, unknown>;
  const command = argsObj.command as string | undefined;
  const path = argsObj.path as string | undefined;

  if (toolName === "str_replace_editor" && path) {
    const name = basename(path);
    switch (command) {
      case "create":
        return { text: isComplete ? `Created ${name}` : `Creating ${name}`, fullPath: path };
      case "str_replace":
      case "insert":
        return { text: isComplete ? `Edited ${name}` : `Editing ${name}`, fullPath: path };
      case "view":
        return { text: isComplete ? `Read ${name}` : `Reading ${name}`, fullPath: path };
      default:
        return { text: isComplete ? `Modified ${name}` : `Modifying ${name}`, fullPath: path };
    }
  }

  if (toolName === "file_manager" && path) {
    const name = basename(path);
    const newPath = argsObj.new_path as string | undefined;
    switch (command) {
      case "rename":
        if (isComplete && newPath) {
          return { text: `Renamed ${name} → ${basename(newPath)}`, fullPath: `${path} → ${newPath}` };
        }
        return { text: isComplete ? `Renamed ${name}` : `Renaming ${name}`, fullPath: path };
      case "delete":
        return { text: isComplete ? `Deleted ${name}` : `Deleting ${name}`, fullPath: path };
      default:
        return { text: toolName };
    }
  }

  return { text: toolName };
}

export function ToolInvocationStatus({
  toolInvocation,
}: ToolInvocationStatusProps) {
  const isComplete =
    toolInvocation.state === "result" && !!toolInvocation.result;
  const { text, fullPath } = getToolLabel(
    toolInvocation.toolName,
    toolInvocation.args,
    isComplete
  );

  return (
    <div
      className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200"
      title={fullPath}
    >
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" data-testid="status-complete"></div>
          <span className="text-neutral-700">{text}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" data-testid="status-loading" />
          <span className="text-neutral-700">{text}</span>
        </>
      )}
    </div>
  );
}
