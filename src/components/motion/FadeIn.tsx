"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type Props = HTMLMotionProps<"div"> & { delay?: number; y?: number };

// Scroll-triggered reveal used to add life to sections below the fold -
// fires once when ~20% scrolled into view, matching the timing/easing of
// the original site's load-triggered `.fade-up` but extended to scroll.
export function FadeIn({ delay = 0, y = 24, children, ...props }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
