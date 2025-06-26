
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg",
        secondary:
          "border-transparent bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-300",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg",
        outline: "text-foreground border-purple-200 hover:bg-purple-50",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg",
        warning: "border-transparent bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
