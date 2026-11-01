---
id: "AO-009"
title: "Six problems Claude never flagged while I learned to code"
summary: "What went wrong when I built my AI game with Claude Sonnet 4 in summer 2025, pasting code by hand. Six failures, how each one happened, and the rule I still follow because of them."
date: 2026-08-08
status: "note"
tags: ["llm-monster-hunter", "prompting", "context-window", "lessons"]
series: ["origin", "llm-monster-hunter"]
draft: false
topic: "learning"
project: ["origin", "llm-monster-hunter"]
preview:
  verdict: "Never delegate blind"
  takeaway: "Never hand the model a decision you can't check, because it won't warn you about a bad name, a bloated design, its memory filling up or a file it never saw."
  points:
    - "As a long chat fills its memory, it gets dumber, more agreeable and more likely to make things up, with no warning."
    - "It agreed with every guess, even after I told it I was a novice. A question would have cost ten seconds."
    - "Each new component copied every option of the one before plus one more, until my form had 25 of them."
  image: "/media/previews/everything-sonnet-got-wrong.webp"
  alt: "Maren Holt's card from the game: an older woman with a red-streaked braid in front of a lighthouse"
---

In summer 2025 I built my AI game, [LLM Monster Hunter](/ledger/monster-hunter-was-my-degree/),
with Claude's Sonnet 4 model. I had no agent (an AI that edits your files by itself), so I pasted
code back and forth by hand. Six things went wrong, and **every time, Claude didn't tell me
something I needed to know.**

The rule I took from that summer is **never hand the model a decision you can't check
yourself.** Some of this is [much better today](/ledger/sonnet-vs-opus-gauntlet/), which makes
the rule easier to forget.

What went wrong:

- **It fixed everything in one place.**
- **It built on a bad name for months.**
- **Each component copied the last one plus one more option,** until my form took 25.
- **It agreed with every guess,** even after I said I was a novice.
- **It got worse as the chat got longer,** with no warning.
- **It held a whole conversation about a file it never saw.**

<figure>
  <img src="/media/llm-monster-hunter/card.webp" alt="Two cards from the game: Luminel, a glowing cream-colored moth with starry blue wings in a mossy forest, and Maren Holt, an older woman with a red-streaked braid in front of a lighthouse" loading="lazy">
  <figcaption>Cards from LLM Monster Hunter, where an AI makes up every monster as you play.</figcaption>
</figure>

## It fixed five things in one file

Ask it for five fixes and it makes all five in one place, whatever that does to you next week. My
files grew into super-files holding four unrelated jobs that had come up in the same message. I
couldn't safely change any of them. That's how I learned to give each job its own file.

## It never questioned a bad name

I asked it to make a file and called it a service, a programming word I'd heard. It wasn't one and
never became one, and Claude never said so. For months, that wrong name decided where the file
lived, what used it and what got added to it. A wrong name doesn't break anything you can see, so nothing makes you
fix it.

## Each component copied the one before it

I wanted reusable screen pieces like buttons and cards, which programmers call components. Their
settings are called props. I didn't know which ones I needed, so I asked Sonnet.

From memory, every new component got every prop of the last one, plus one more. Badge took `variant` and
`className`, two style settings, so Button took those and `size`. Card added `padding`. Nothing
ever dropped a prop, because each was made with the last one as its example. The last thing built
was the form, and it took 25 props. And that's only the box around the inputs, which had grown
props the same way.

<details><summary>The form component, all 25 props</summary>

This is from memory too. This exact file isn't in the game's saved history on GitHub. The first Form saved there, in July
2025, takes 6 props.

```jsx
// Form Component - Flexible form container with full state and layout support
// Handles submission, validation, loading, errors, labels, icons, and sizing
// Designed for maximum reusability across all form contexts

import React from 'react';
import './form.css';

/**
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.className - Additional CSS classes
 * @param {object} props.style - Inline style overrides
 * @param {string} props.variant - Visual variant (default, primary, subtle, danger)
 * @param {string} props.size - Size scale (sm, md, lg)
 * @param {string} props.padding - Padding scale (none, sm, md, lg)
 * @param {string} props.align - Content alignment (left, center, right)
 * @param {boolean} props.fullWidth - Stretch to container width
 * @param {boolean} props.loading - Show loading state during submission
 * @param {string} props.loadingText - Text shown while loading
 * @param {boolean} props.disabled - Disable the entire form
 * @param {string} props.error - Form-level error message
 * @param {string} props.errorPosition - Where to render the error (top, bottom)
 * @param {string} props.label - Form label
 * @param {string} props.labelPosition - Label placement (top, left)
 * @param {string} props.helpText - Helper text below the form
 * @param {boolean} props.required - Mark the form as required
 * @param {React.ReactNode} props.icon - Icon rendered beside the label
 * @param {string} props.iconPosition - Icon placement (left, right)
 * @param {string} props.testId - data-testid for testing
 * @param {string} props.ariaLabel - Accessible label
 * @param {Function} props.onSubmit - Submission handler
 * @param {Function} props.onReset - Reset handler
 * @param {Function} props.onValidate - Validation handler, returns error string or null
 * @param {boolean} props.validateOnChange - Run validation on every change
 */
function Form({
  children,
  className = '',
  style = {},
  variant = 'default',
  size = 'md',
  padding = 'md',
  align = 'left',
  fullWidth = false,
  loading = false,
  loadingText = 'Submitting...',
  disabled = false,
  error = null,
  errorPosition = 'top',
  label = null,
  labelPosition = 'top',
  helpText = null,
  required = false,
  icon = null,
  iconPosition = 'left',
  testId = null,
  ariaLabel = null,
  onSubmit = null,
  onReset = null,
  onValidate = null,
  validateOnChange = false,
  ...rest
}) {

  const [internalError, setInternalError] = React.useState(null);
  const activeError = error || internalError;

  const formClasses = [
    'form',
    `form-${variant}`,
    `form-size-${size}`,
    `form-padding-${padding}`,
    `form-align-${align}`,
    fullWidth && 'form-full-width',
    loading && 'form-loading',
    disabled && 'form-disabled',
    required && 'form-required',
    activeError && 'form-with-error',
    label && `form-label-${labelPosition}`,
    icon && `form-icon-${iconPosition}`,
    className
  ].filter(Boolean).join(' ');

  // Handle validation, if a validator was provided
  const runValidation = (event) => {
    if (!onValidate) return true;
    const result = onValidate(event);
    setInternalError(result || null);
    return !result;
  };

  const handleChange = (event) => {
    if (validateOnChange) {
      runValidation(event);
    }
  };

  // Handle form submission with loading and disabled guards
  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading || disabled) return;
    if (!runValidation(event)) return;
    if (onSubmit) onSubmit(event);
  };

  const handleReset = (event) => {
    if (loading || disabled) return;
    setInternalError(null);
    if (onReset) onReset(event);
  };

  const renderedLabel = label && (
    <div className="form-label">
      {icon && iconPosition === 'left' && <span className="form-icon">{icon}</span>}
      {label}
      {required && <span className="form-required-marker">*</span>}
      {icon && iconPosition === 'right' && <span className="form-icon">{icon}</span>}
    </div>
  );

  const renderedError = activeError && (
    <div className="form-error-message">❌ {activeError}</div>
  );

  return (
    <form
      className={formClasses}
      style={style}
      onSubmit={handleSubmit}
      onReset={handleReset}
      onChange={handleChange}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-invalid={!!activeError}
      {...rest}
    >
      {renderedLabel}
      {errorPosition === 'top' && renderedError}
      {children}
      {errorPosition === 'bottom' && renderedError}
      {helpText && <div className="form-help-text">{helpText}</div>}
    </form>
  );
}

export default Form;
```

</details>

I'd handed the one decision I couldn't judge to the thing that would confidently over-build it.

## The most expensive one: it agreed with everything

I told it plainly and often that I was a novice and that what followed was a guess. Every guess
still came back as a solid plan. A question would have cost me ten seconds. Agreeing cost me a
component library and a lot of the architecture I later ripped out. Honestly, it still taught me.
Every bad instinct got built out to full size until I ran into it, and I haven't over-built a
component since.

## The big one: it gets worse as the chat fills up

A chat's context window is how much text the model can hold in its head at once. As it fills up,
the model keeps talking with the same confidence. But it gets less smart, more agreeable, more
likely to make things up and less aware of any of it, with no error and no warning.

Now I watch the window on every long session and every [agent I run](/ledger/i-dont-learn-programming-anymore/).
It's much milder now, but it hasn't gone to zero.

## A whole conversation about a file it never saw

I'd been working on the frontend, the part of the game you see, with those files attached to the
chat. Then I switched to the backend, the part behind it, and forgot to swap the files. I had a whole
conversation about a backend file the model had never seen. It reasoned about it and wrote code for
it, guessing the whole time, and never once said "I don't have that." I found out from the errors. Now I check what's
attached before I trust an answer.

Previously: [Learning to program by building an AI monster game](/ledger/monster-hunter-was-my-degree/).
Next: [Restarting my AI game after a ten-month stall](/ledger/the-wall-that-stopped-me/).
