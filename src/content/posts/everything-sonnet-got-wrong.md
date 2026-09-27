---
id: "AO-009"
title: "Everything Sonnet 4 got wrong, and what each one taught me"
summary: "Super-files, scope creep, a component library that got more complicated with every component, praise for ideas I'd explicitly said I didn't understand, and one entire conversation about backend files I never actually attached. Every failure was a missing signal, not a missing capability."
date: 2026-08-08
status: "note"
tags: ["llm-monster-hunter", "prompting", "context-window", "lessons"]
series: ["origin", "llm-monster-hunter"]
draft: false
---

Third of five. Previously:
[LLM Monster Hunter was my computer science degree](/ledger/monster-hunter-was-my-degree/).

This is the catalog. Summer 2025, Claude Sonnet 4, no agent, me pasting code by hand. Some
of this is much better now. All of it changed how I prompt, and a few of them still bite.

## It solves the whole problem in front of it and ignores the consequences

Ask it to fix five things and it will fix five things, in one place, right now, with no
regard for what that does to you next week. The output was **super-files** — enormous
amalgamations where four unrelated responsibilities lived together because they'd all come
up in the same message.

That's what taught me separation of concerns. Not a book. Watching the same file grow a
fourth job and realizing I could no longer change any one of them safely.

## Names are load-bearing, and it will accept a bad one forever

At one point I asked it to make a file and called it a service, because "service" was a
word I'd heard. It wasn't a service. It never became one. But the name stuck, and every
downstream decision — where it lived, what imported it, what got added to it — inherited
that wrong idea for months.

The model will not tell you the name is wrong. It will build faithfully on top of your
misunderstanding. **A bad name is a bug that compiles.**

## Scope creep, in the exact place I couldn't check it

The clearest example. I wanted reusable frontend components, but I didn't know which
components I needed or what props they should take. So I did the natural thing: I asked
Sonnet to figure that out for me.

Here is the mechanism, and it's dumber than it sounds. Every new component inherited every
prop the previous component had, plus one more. Badge takes `variant` and `className`, so
Button takes `variant` and `className` and `size`. Card takes those three and `padding`.
Nothing ever *dropped* a prop, because each component was generated with the last one in
context as the house style, and matching the house style meant matching the whole surface.
It ratcheted.

So the props aren't a design. They're an accumulation. And whatever got built last inherited
the entire history of everything built before it.

The thing built last was the form.

### The form

Twenty-five props.

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

And this is only the container. It doesn't collect anything. The actual inputs are separate
components, and they'd been through the same ratchet.

The lesson isn't "don't let it design components." It's that **I delegated the one decision
I had no way to evaluate.** I couldn't tell a good component boundary from a bad one, so I
handed that exact judgment to the thing that would confidently over-produce, and I had no
instrument to catch it with.

## It agreed with me when I had told it I didn't know anything

This one was the most expensive.

I said it explicitly and I said it often: I'm a novice, I don't know how any of this works,
what follows is a guess.

Every guess came back as a solid plan. Every idea was a great one. Every suggestion, a spec
sheet.

When you're learning, you need the model to be a check on you. This was an amplifier
instead — and an amplifier does exactly one thing to a bad idea, which is make it louder. A
question would have cost me ten seconds. Agreement cost me a component library.

Which, I have to admit, is a teaching method. Not a gentle one. Nothing ever got quietly
corrected on the way in; every bad instinct I had got built out to full scale and then
pile-drove my face into a wall, and at that size you cannot fail to see what you did. I did
not learn YAGNI from a book, or from anyone telling me. I learned it from staring at a form
component with twenty-five props that existed for exactly one reason: I asked a question I
wasn't qualified to ask, and got an enthusiastic answer.

If I couldn't learn it from that, I wasn't going to learn it.

The bill was real — a lot of the architecture I later had to rip out exists because I
proposed something bad and got agreement instead of a question. But I have never once
over-built a component since.

## Context rot, with no warning light

The one I want most people to know about.

As the context window fills up, the model doesn't stop working. It keeps talking, in the
same voice, at the same confidence. But it gets less intelligent, more sycophantic, more
hallucinatory, and — worst of all — *less aware that any of that is happening*. All four at
once, and no error, no banner, nothing.

I learned that by living inside it for a summer, which is why it's permanent for me now. I
watch the window on every long session, and it's the first thing I think about when I'm
running agents that manage their own context. It's much less severe than it was. It has not
gone to zero.

## The conversation about files it never had

The story I tell when someone asks what the failure mode really looks like.

I'd been working on the frontend, so the frontend files were attached. I switched to the
backend and forgot to swap them out.

Then I had an entire conversation about a backend file the model had never seen. It
discussed the file. It reasoned about the file. It wrote code *for* the file. It was
guessing the whole way, from the first message to the last, and at no point did it say
"I don't have that." I found out from the errors.

## What connects all of them

Not one of these was a capability problem. Every single one was a **missing signal**.

It couldn't tell me the name was wrong. It couldn't tell me the component was bloated. It
couldn't tell me it was agreeing out of politeness, or that its context was full, or that
it was working from a file it had never been given.

So the thing I actually built that summer wasn't a game. It was my own instrumentation:
check what's in context before you trust an answer, watch the window, verify claims against
the file, and never delegate a decision you have no way to evaluate. That last one is the
rule I'd hand to anyone starting now — because it's still true, and the models are good
enough that it's much easier to forget.

Next: [The wall that stopped me for ten months, and the week that cleared it](/ledger/the-wall-that-stopped-me/).
