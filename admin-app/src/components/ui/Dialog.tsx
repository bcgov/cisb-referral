import { type ReactNode, useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  size = "md",
}: Readonly<DialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <dialog
      ref={dialogRef}
      className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 p-0 backdrop:bg-black backdrop:bg-opacity-50`}
      aria-labelledby="dialog-title"
      onCancel={handleCancel}
    >
      <div className="flex items-center justify-between p-6 border-b border-bcgov-border">
        <h2
          id="dialog-title"
          className="text-xl font-bold text-bcgov-gray-dark m-0"
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-bcgov-gray hover:text-bcgov-gray-dark"
          aria-label="Close dialog"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
