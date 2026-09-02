import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  el?: React.ElementType;
  once?: boolean;
}

export function AnimatedText({
  text,
  className = '',
  el: Wrapper = 'span',
  once = true,
}: AnimatedTextProps) {
  const defaultAnimations = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  };

  return (
    <Wrapper className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-50px" }}
        transition={{ staggerChildren: 0.015, delayChildren: 0.1 }}
        aria-hidden
        className="inline-block"
      >
        {text.split(' ').map((word, wordIndex, wordsArray) => (
          <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
            {word.split('').map((char, charIndex) => (
              <motion.span
                key={`char-${wordIndex}-${charIndex}`}
                variants={defaultAnimations}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
            {wordIndex < wordsArray.length - 1 && '\u00A0'}
          </span>
        ))}
      </motion.span>
      <span className="sr-only">{text}</span>
    </Wrapper>
  );
}
