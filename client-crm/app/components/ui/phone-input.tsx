"use client"

import * as React from "react"
import { useRef } from "react"
import { cn } from "@/helpers/utils"
import { formatPhoneNumber } from "@/app/components/pages/chat/phone-formatter"

export interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: string
  onChange: (value: string) => void
  onFormattedChange?: (formatted: string) => void
}

/**
 * Phone input component with real-time formatting for USA numbers
 * Formats as user types: +1(XXX)-XXX-XXXX
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, onFormattedChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const combinedRef = (ref || inputRef) as React.RefObject<HTMLInputElement>

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const inputValue = e.target.value
      const cursorPosition = e.target.selectionStart || 0

      // Remove all formatting (brackets, dashes) - keep only digits and +
      let cleaned = inputValue.replace(/[^\d+]/g, '')
      
      // Limit length based on format
      const digits = cleaned.replace(/[^0-9]/g, '')
      
      // Check for international codes (+2 to +9, and multi-digit codes like +44, +86, etc.)
      // Match: + followed by 1-3 digits (country code), but not +1
      const internationalCodeMatch = cleaned.match(/^\+(\d{1,3})/)
      
      if (internationalCodeMatch && !cleaned.startsWith('+1')) {
        // International format: max 15 digits total (ITU-T E.164 standard)
        if (digits.length > 15) {
          cleaned = '+' + digits.slice(0, 15)
        }
      } else if (cleaned.startsWith('+1')) {
        // USA format: +1 + 10 digits = maximum 11 digits total
        if (digits.length > 11) {
          cleaned = '+1' + digits.slice(1, 11)
        }
      } else if (cleaned.startsWith('+')) {
        // Other international formats: max 15 digits total
        if (digits.length > 15) {
          cleaned = '+' + digits.slice(0, 15)
        }
      } else {
        // No + prefix: limit to 10 digits (will be formatted as +1)
        if (digits.length > 10) {
          cleaned = digits.slice(0, 10)
        }
      }

      // Count formatting characters before cursor position
      const beforeCursor = inputValue.slice(0, cursorPosition)
      const formattingBeforeCursor = (beforeCursor.match(/[()-\s]/g) || []).length

      // Call onChange with cleaned value (for parent component to store)
      onChange(cleaned)

      // Format for display with brackets and dashes in real-time
      const formatted = formatPhoneNumber(cleaned)
      if (onFormattedChange) {
        onFormattedChange(formatted)
      }

      // Restore cursor position after formatting
      const newCursorPosition = Math.max(
        0,
        Math.min(
          cursorPosition - formattingBeforeCursor + (formatted.length - cleaned.length),
          formatted.length
        )
      )

      // Use setTimeout to ensure DOM is updated before setting cursor
      setTimeout(() => {
        if (combinedRef.current) {
          combinedRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
        }
      }, 0)
    }

    // Format the current value for display
    const formattedValue = formatPhoneNumber(value)

    return (
      <input
        ref={combinedRef}
        type="tel"
        data-slot="phone-input"
        value={formattedValue}
        onChange={handleChange}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"

export { PhoneInput }

