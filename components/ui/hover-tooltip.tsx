"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

type HoverTooltipProps = {
  content?: string;
  children: ReactNode;
  className?: string;
};

type TooltipPos = {
  x: number;
  y: number;
  placeAbove: boolean;
};

export function HoverTooltip({ content, children, className }: HoverTooltipProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<TooltipPos>({ x: 0, y: 0, placeAbove: true });

  const tooltipStyle = useMemo(() => {
    const y = pos.placeAbove ? pos.y - 14 : pos.y + 14;
    const transform = pos.placeAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)";
    return {
      left: `${pos.x}px`,
      top: `${y}px`,
      transform,
    };
  }, [pos]);

  if (!content) return <>{children}</>;

  function updateFromPointer(clientX: number, clientY: number) {
    setPos({
      x: clientX,
      y: clientY,
      // If trigger is near top of viewport, place tooltip below cursor.
      placeAbove: clientY > 72,
    });
  }

  function onMouseEnter(e: React.MouseEvent<HTMLSpanElement>) {
    updateFromPointer(e.clientX, e.clientY);
    setOpen(true);
  }

  function onMouseMove(e: React.MouseEvent<HTMLSpanElement>) {
    updateFromPointer(e.clientX, e.clientY);
  }

  function onFocus() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    setPos({ x, y, placeAbove: y > 72 });
    setOpen(true);
  }

  return (
    <span
      ref={triggerRef}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setOpen(false)}
      onFocus={onFocus}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[120] max-w-[18rem] rounded-md bg-zinc-900 px-2 py-1 text-center text-[11px] font-medium leading-tight text-white shadow-md"
          style={tooltipStyle}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
