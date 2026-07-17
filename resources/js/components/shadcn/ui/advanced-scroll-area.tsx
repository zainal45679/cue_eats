"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const DATA_TOP_SCROLL = "data-top-scroll";
const DATA_BOTTOM_SCROLL = "data-bottom-scroll";
const DATA_LEFT_SCROLL = "data-left-scroll";
const DATA_RIGHT_SCROLL = "data-right-scroll";
const DATA_TOP_BOTTOM_SCROLL = "data-top-bottom-scroll";
const DATA_LEFT_RIGHT_SCROLL = "data-left-right-scroll";

const advancedScrollerVariants = cva("", {
  variants: {
    orientation: {
      vertical: [
        "data-[top-scroll=true]:[mask-image:linear-gradient(0deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[bottom-scroll=true]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[top-bottom-scroll=true]:[mask-image:linear-gradient(#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
      ],
      horizontal: [
        "data-[left-scroll=true]:[mask-image:linear-gradient(270deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[right-scroll=true]:[mask-image:linear-gradient(90deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[left-right-scroll=true]:[mask-image:linear-gradient(to_right,#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
      ],
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

type ScrollDirection = "up" | "down" | "left" | "right";

type ScrollVisibility = {
  [key in ScrollDirection]: boolean;
};

interface AdvancedScrollAreaProps
  extends VariantProps<typeof advancedScrollerVariants>,
    React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  size?: number;
  offset?: number;
  withNavigation?: boolean;
  scrollStep?: number;
  scrollTriggerMode?: "press" | "hover" | "click";
}

function AdvancedScrollArea(props: AdvancedScrollAreaProps) {
  const {
    orientation = "vertical",
    className,
    children,
    size = 40,
    offset = 0,
    scrollStep = 40,
    withNavigation = false,
    scrollTriggerMode = "press",
    ...scrollAreaProps
  } = props;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollVisibility, setScrollVisibility] =
    React.useState<ScrollVisibility>({
      up: false,
      down: false,
      left: false,
      right: false,
    });

  const onScrollBy = React.useCallback(
    (direction: ScrollDirection) => {
      const container = containerRef.current;
      if (!container) return;

      const scrollMap: Record<ScrollDirection, () => void> = {
        up: () => (container.scrollTop -= scrollStep),
        down: () => (container.scrollTop += scrollStep),
        left: () => (container.scrollLeft -= scrollStep),
        right: () => (container.scrollLeft += scrollStep),
      };

      scrollMap[direction]();
    },
    [scrollStep]
  );

  const scrollHandlers = React.useMemo(
    () => ({
      up: () => onScrollBy("up"),
      down: () => onScrollBy("down"),
      left: () => onScrollBy("left"),
      right: () => onScrollBy("right"),
    }),
    [onScrollBy]
  );

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onScroll() {
      if (!container) return;

      const isVertical = orientation === "vertical";

      if (isVertical) {
        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;

        if (withNavigation) {
          setScrollVisibility((prev) => {
            const newUp = scrollTop > offset;
            const newDown = scrollTop + clientHeight < scrollHeight;

            if (prev.up !== newUp || prev.down !== newDown) {
              return {
                ...prev,
                up: newUp,
                down: newDown,
              };
            }
            return prev;
          });
        }

        const hasTopScroll = scrollTop > offset;
        const hasBottomScroll =
          scrollTop + clientHeight + offset < scrollHeight;
        const isVerticallyScrollable = scrollHeight > clientHeight;

        if (hasTopScroll && hasBottomScroll && isVerticallyScrollable) {
          container.setAttribute(DATA_TOP_BOTTOM_SCROLL, "true");
          container.removeAttribute(DATA_TOP_SCROLL);
          container.removeAttribute(DATA_BOTTOM_SCROLL);
        } else {
          container.removeAttribute(DATA_TOP_BOTTOM_SCROLL);
          if (hasTopScroll) container.setAttribute(DATA_TOP_SCROLL, "true");
          else container.removeAttribute(DATA_TOP_SCROLL);
          if (hasBottomScroll && isVerticallyScrollable)
            container.setAttribute(DATA_BOTTOM_SCROLL, "true");
          else container.removeAttribute(DATA_BOTTOM_SCROLL);
        }
      }

      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;
      const scrollWidth = container.scrollWidth;

      if (withNavigation) {
        setScrollVisibility((prev) => {
          const newLeft = scrollLeft > offset;
          const newRight = scrollLeft + clientWidth < scrollWidth;

          if (prev.left !== newLeft || prev.right !== newRight) {
            return {
              ...prev,
              left: newLeft,
              right: newRight,
            };
          }
          return prev;
        });
      }

      const hasLeftScroll = scrollLeft > offset;
      const hasRightScroll = scrollLeft + clientWidth + offset < scrollWidth;
      const isHorizontallyScrollable = scrollWidth > clientWidth;

      if (hasLeftScroll && hasRightScroll && isHorizontallyScrollable) {
        container.setAttribute(DATA_LEFT_RIGHT_SCROLL, "true");
        container.removeAttribute(DATA_LEFT_SCROLL);
        container.removeAttribute(DATA_RIGHT_SCROLL);
      } else {
        container.removeAttribute(DATA_LEFT_RIGHT_SCROLL);
        if (hasLeftScroll) container.setAttribute(DATA_LEFT_SCROLL, "true");
        else container.removeAttribute(DATA_LEFT_SCROLL);
        if (hasRightScroll && isHorizontallyScrollable)
          container.setAttribute(DATA_RIGHT_SCROLL, "true");
        else container.removeAttribute(DATA_RIGHT_SCROLL);
      }
    }

    onScroll();
    container.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [orientation, offset, withNavigation]);

  const composedStyle = React.useMemo<React.CSSProperties>(
    () =>
      ({
        "--scroll-shadow-size": `${size}px`,
      }) as React.CSSProperties,
    [size]
  );

  const activeDirections = React.useMemo<ScrollDirection[]>(() => {
    if (!withNavigation) return [];
    return orientation === "vertical" ? ["up", "down"] : ["left", "right"];
  }, [orientation, withNavigation]);

  const navigationButtons = React.useMemo(() => {
    if (!withNavigation) return null;

    return activeDirections
      .filter((direction) => scrollVisibility[direction])
      .map((direction) => (
        <ScrollButton
          data-slot="scroll-button"
          direction={direction}
          key={direction}
          onClick={scrollHandlers[direction]}
          triggerMode={scrollTriggerMode}
        />
      ));
  }, [
    activeDirections,
    scrollVisibility,
    scrollHandlers,
    scrollTriggerMode,
    withNavigation,
  ]);

  return (
    <div className={cn("relative w-full", className)}>
      {navigationButtons}
      <ScrollAreaPrimitive.Root
        className={cn("relative", className)}
        data-slot="scroll-area"
        {...scrollAreaProps}
      >
        <ScrollAreaPrimitive.Viewport
          className={cn(
            "size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50",
            advancedScrollerVariants({ orientation })
          )}
          data-slot="scroll-area-viewport"
          ref={containerRef}
          style={composedStyle}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    </div>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        "flex touch-none select-none p-px transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className="relative flex-1 rounded-full bg-border"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

const scrollButtonVariants = cva(
  "absolute z-10 transition-opacity [&>svg]:size-4 [&>svg]:opacity-80 hover:[&>svg]:opacity-100",
  {
    variants: {
      direction: {
        up: "-translate-x-1/2 top-2 left-1/2",
        down: "-translate-x-1/2 bottom-2 left-1/2",
        left: "-translate-y-1/2 top-1/2 left-2",
        right: "-translate-y-1/2 top-1/2 right-2",
      },
    },
    defaultVariants: {
      direction: "up",
    },
  }
);

const directionToIcon: Record<ScrollDirection, React.ElementType> = {
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
} as const;

interface ScrollButtonProps extends React.ComponentProps<"button"> {
  direction: ScrollDirection;
  triggerMode?: "press" | "hover" | "click";
}

function ScrollButton(props: ScrollButtonProps) {
  const {
    direction,
    className,
    triggerMode = "press",
    onClick,
    ref,
    ...buttonProps
  } = props;

  const [autoScrollTimer, setAutoScrollTimer] = React.useState<number | null>(
    null
  );

  const onAutoScrollStart = React.useCallback(
    (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (autoScrollTimer !== null) return;

      if (triggerMode === "press") {
        const timer = window.setInterval(onClick ?? (() => {}), 50);
        setAutoScrollTimer(timer);
      } else if (triggerMode === "hover") {
        const timer = window.setInterval(() => {
          if (event) onClick?.(event);
        }, 50);
        setAutoScrollTimer(timer);
      }
    },
    [autoScrollTimer, onClick, triggerMode]
  );

  const onAutoScrollStop = React.useCallback(() => {
    if (autoScrollTimer === null) return;

    window.clearInterval(autoScrollTimer);
    setAutoScrollTimer(null);
  }, [autoScrollTimer]);

  const eventHandlers = React.useMemo(() => {
    const triggerModeHandlers: Record<
      NonNullable<AdvancedScrollAreaProps["scrollTriggerMode"]>,
      React.ComponentProps<"button">
    > = {
      press: {
        onPointerDown: onAutoScrollStart,
        onPointerUp: onAutoScrollStop,
        onPointerLeave: onAutoScrollStop,
        onClick: () => {},
      },
      hover: {
        onPointerEnter: onAutoScrollStart,
        onPointerLeave: onAutoScrollStop,
        onClick: () => {},
      },
      click: {
        onClick,
      },
    } as const;

    return triggerModeHandlers[triggerMode] ?? {};
  }, [triggerMode, onAutoScrollStart, onAutoScrollStop, onClick]);

  React.useEffect(() => () => onAutoScrollStop(), [onAutoScrollStop]);

  const Icon = directionToIcon[direction];

  return (
    <button
      type="button"
      {...buttonProps}
      {...eventHandlers}
      className={cn(scrollButtonVariants({ direction, className }))}
      ref={ref}
    >
      <Icon />
    </button>
  );
}

export { AdvancedScrollArea, ScrollBar };
