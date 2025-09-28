import Header from "@/components/sections/header";
import HeroCarousel from "@/components/sections/hero-carousel";
import RecentArticles from "@/components/sections/recent-articles";
import TopTopics from "@/components/sections/top-topics";
import DontMissSection from "@/components/sections/dont-miss";
import StoriesForYou from "@/components/sections/stories-for-you";
import LatestNews from "@/components/sections/latest-news";
import NewsletterSignup from "@/components/sections/newsletter-signup";
import SidebarSocial from "@/components/sections/sidebar-social";
import SidebarMoreNews from "@/components/sections/sidebar-more-news";
import Footer from "@/components/sections/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="flex flex-col">
        <HeroCarousel />
        <RecentArticles />
        <TopTopics />
        <DontMissSection />
        <StoriesForYou />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LatestNews />
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6 border-b border-border pb-4">
                    Follow Us
                  </h3>
                  <SidebarSocial />
                </div>
                
                <SidebarMoreNews />
              </div>
            </div>
          </div>
        </div>
        
        <NewsletterSignup />
        <Footer />
      </div>
    </main>
  );
}