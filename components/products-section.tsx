import { ProductCard } from "@/components/product-card"
import { Heart, Users, MessageSquare } from "lucide-react"

const products = {
  likes: [
    {
      package_id: "likes_1k",
      amount: 1000,
      price: 10,
      description: "1,000 likes on your post",
      icon: Heart,
    },
    {
      package_id: "likes_5k",
      amount: 5000,
      price: 45,
      description: "5,000 likes on your post",
      icon: Heart,
      popular: true,
    },
    {
      package_id: "likes_10k",
      amount: 10000,
      price: 80,
      description: "10,000 likes on your post",
      icon: Heart,
    },
  ],
  followers: [
    {
      package_id: "followers_500",
      amount: 500,
      price: 15,
      description: "500 high-quality followers",
      icon: Users,
    },
    {
      package_id: "followers_1k",
      amount: 1000,
      price: 25,
      description: "1,000 high-quality followers",
      icon: Users,
      popular: true,
    },
    {
      package_id: "followers_5k",
      amount: 5000,
      price: 100,
      description: "5,000 high-quality followers",
      icon: Users,
    },
  ],
  comments: [
    {
      package_id: "comments_50",
      amount: 50,
      price: 10,
      description: "50 custom comments",
      icon: MessageSquare,
    },
    {
      package_id: "comments_100",
      amount: 100,
      price: 18,
      description: "100 custom comments",
      icon: MessageSquare,
      popular: true,
    },
  ],
}

export function ProductsSection() {
  return (
    <section id="products" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl mb-4">
            Choose Your Package
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Select the perfect package to boost your social media presence. All prices in GHS.
          </p>
        </div>

        <div className="space-y-16">
          {/* Likes Section */}
          <div>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Instagram Likes
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.likes.map((product) => (
                <ProductCard key={product.package_id} product={product} />
              ))}
            </div>
          </div>

          {/* Followers Section */}
          <div>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Instagram Followers
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.followers.map((product) => (
                <ProductCard key={product.package_id} product={product} />
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Instagram Comments
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.comments.map((product) => (
                <ProductCard key={product.package_id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
