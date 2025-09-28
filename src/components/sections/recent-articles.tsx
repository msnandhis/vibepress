import Link from 'next/link';

interface Article {
  number: string;
  category: {
    name: string;
    color: string;
  };
  title: string;
  date: string;
  url: string;
}

const recentArticles: Article[] = [
  {
    number: "1",
    category: { name: "Tech", color: "bg-primary" },
    title: "10 Ways To Reduce Motion Sickness When Using VR",
    date: "May 26, 2024",
    url: "https://jellywp.com/wp/vibepress7/10-ways-to-reduce-motion-sickness-when-using-vr/",
  },
  {
    number: "2",
    category: { name: "Business", color: "bg-[#F59E0B]" },
    title: "The ONLY Graphic Design Tutorial You’ll Ever Need!",
    date: "May 26, 2024",
    url: "https://jellywp.com/wp/vibepress7/the-only-graphic-design-tutorial-youll-ever-need/",
  },
  {
    number: "3",
    category: { name: "Active", color: "bg-[#10B981]" },
    title: "Latest blown lead for Raiders signals enough is enough of McDaniels",
    date: "May 26, 2024",
    url: "https://jellywp.com/wp/vibepress7/latest-blown-lead-for-raiders-signals-enough-is-enough-of-mcdaniels/",
  },
  {
    number: "4",
    category: { name: "Social", color: "bg-[#EF4444]" },
    title: "How to make your life routine more fun and eco-friendly",
    date: "May 24, 2024",
    url: "https://jellywp.com/wp/vibepress7/how-to-make-your-beauty-routine-more-sustainable-and-eco-friendly/",
  },
];

const RecentArticles = () => {
  return (
    <section className="py-10 bg-secondary">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentArticles.map((article) => (
            <div key={article.number} className="bg-card rounded-xl border border-border p-6 flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl font-bold text-gray-200 -mt-1 leading-none">
                    {article.number}
                  </span>
                  <Link
                    href={article.url}
                    className={`${article.category.color} text-primary-foreground text-xs font-bold py-1.5 px-3 rounded-md`}
                  >
                    {article.category.name}
                  </Link>
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-4 h-[63px] overflow-hidden leading-snug">
                  <Link
                    href={article.url}
                    className="line-clamp-3 hover:text-primary transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>
              </div>
              <div className="mt-auto">
                <p className="text-muted-foreground text-sm">{article.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentArticles;