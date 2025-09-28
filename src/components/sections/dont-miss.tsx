import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Article {
  id: number;
  image: string;
  category: {
    name: string;
    slug: string;
    style: string;
  };
  rating?: string;
  title: string;
  excerpt: string;
  author: {
    name:string;
    avatar: string;
    slug: string;
  };
  date: string;
  slug: string;
}

const articles: Article[] = [
  {
    id: 1,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Modern-Smartphone-Grasped-in-Medium-Skin-Toned-Hand-with-Abstract-Wallpaper-680x453-18.jpeg",
    category: {
      name: 'Tech',
      slug: '#',
      style: 'bg-tag-tech text-white',
    },
    title: "Impressive 1st-Quarter Results Spark PayPal's Comeback",
    excerpt: "What’s made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      name: 'Kelly',
      avatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg',
      slug: '#',
    },
    date: 'June 5, 2024',
    slug: '#',
  },
  {
    id: 2,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Software-Developer-at-Work-680x512-19.jpeg",
    category: {
      name: 'Tech',
      slug: '#',
      style: 'bg-tag-tech text-white',
    },
    title: 'Tencent Music Entertainment Group Sponsored ADR (TME)',
    excerpt: "What’s made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      name: 'Kelly',
      avatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg',
      slug: '#',
    },
    date: 'June 5, 2024',
    slug: '#',
  },
  {
    id: 3,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Vintage-Rangefinder-Camera-with-Leatherette-Detail-680x512-20.jpeg",
    category: {
      name: 'Tech',
      slug: '#',
      style: 'bg-tag-tech text-white',
    },
    title: 'Fast food companies compete for the best value meal',
    excerpt: "What’s made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      name: 'Kelly',
      avatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg',
      slug: '#',
    },
    date: 'June 5, 2024',
    slug: '#',
  },
  {
    id: 4,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Futuristic-Abstract-Scene-e1748499024630-680x457-3.jpeg",
    category: {
      name: 'Business',
      slug: '#',
      style: 'bg-tag-business text-white',
    },
    rating: '8.7',
    title: 'What My Mother Taught Me About Black Conservatives',
    excerpt: 'Import demos, pages or elements separately with a click as needed. Single WordPress license gives you access to all of what\'s shown below,...',
    author: {
      name: 'Kelly',
      avatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg',
      slug: '#',
    },
    date: 'May 29, 2024',
    slug: '#',
  },
];

const ArticleCard = ({ article }: { article: Article }) => (
  <div className="bg-card rounded-xl shadow-md flex flex-col h-full border border-border group overflow-hidden transition-shadow duration-300 hover:shadow-lg">
    <div className="relative">
      <Link href={article.slug}>
        <Image
          src={article.image}
          alt={article.title}
          width={680}
          height={453}
          className="w-full h-auto aspect-[1.4] object-cover"
        />
      </Link>
      <Link
        href={article.category.slug}
        className={`absolute top-4 left-4 text-xs font-semibold py-1 px-2.5 rounded-md ${article.category.style} transition-transform duration-300 group-hover:scale-105`}
      >
        {article.category.name}
      </Link>
      {article.rating && (
        <div className="absolute top-4 right-4 bg-rating-badge text-white w-10 h-10 flex items-center justify-center rounded-full font-display font-bold text-sm">
          {article.rating}
        </div>
      )}
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="font-display text-[20px] font-semibold text-foreground mb-3 leading-tight">
        <Link
          href={article.slug}
          className="hover:text-primary transition-colors duration-200"
        >
          {article.title}
        </Link>
      </h3>
      <p className="text-muted-foreground mb-5">{article.excerpt}</p>
      <div className="mt-auto flex items-center gap-3">
        <Link href={article.author.slug}>
          <Image
            src={article.author.avatar}
            alt={article.author.name}
            width={30}
            height={30}
            className="rounded-full"
          />
        </Link>
        <div className="text-sm">
          <Link
            href={article.author.slug}
            className="font-medium text-foreground hover:text-primary transition-colors duration-200"
          >{article.author.name}</Link>
          <span className="text-muted-foreground"> • {article.date}</span>
        </div>
      </div>
    </div>
  </div>
);


const DontMissSection = () => {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-[28px] font-bold text-foreground flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            Don't Miss
          </h2>
          <Link
            href="#"
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <span>View All</span>
              <div className="bg-foreground text-background rounded-full w-5 h-5 flex items-center justify-center">
                <ArrowRight size={12} strokeWidth={3} />
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DontMissSection;