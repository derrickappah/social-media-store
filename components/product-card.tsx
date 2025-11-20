import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, type LucideIcon } from "lucide-react"
import Link from "next/link"

interface ProductCardProps {
  product: {
    package_id: string
    amount: number
    price: number
    description: string
    icon: LucideIcon
    popular?: boolean
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const Icon = product.icon

  return (
    <Card className={`relative ${product.popular ? "border-primary shadow-lg" : ""}`}>
      {product.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>}
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{product.amount.toLocaleString()}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">GHS {product.price}</span>
        </div>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Instant delivery</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>100% real accounts</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>24/7 support</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Money-back guarantee</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={product.popular ? "default" : "outline"} asChild>
          <Link
            href={`https://wa.me/233551234567?text=I want to order ${product.description} for GHS ${product.price}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Order Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
