import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { OrderForm } from "@/components/order-form"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <section id="order-form">
          <OrderForm />
        </section>
      </main>
      <Footer />
    </div>
  )
}
