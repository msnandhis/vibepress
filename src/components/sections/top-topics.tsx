import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Topic {
  name: string;
  articles: number;
  imageUrl: string;
  href: string;
}

const topicsData: Topic[] = [
  {
    name: 'Active',
    articles: 7,
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Modern-Artistic-Armchair-e1748491358818-680x574-12.jpeg',
    href: '#',
  },
  {
    name: 'Business',
    articles: 8,
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Optical-Illusion-Sculpture-680x453-13.jpeg',
    href: '#',
  },
  {
    name: 'Health',
    articles: 8,
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Golden-Brown-French-Toast-with-Garnishing-680x680-14.jpeg',
    href: '#',
  },
  {
    name: 'Inspiration',
    articles: 7,
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Human-Robot-Interaction-680x512-15.jpeg',
    href: '#',
  },
  {
    name: 'Social',
    articles: 8,
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Minimalist-Still-Life-with-Egg-Bowl-and-Pencil-680x512-16.jpeg',
    href: '#',
  },
  {
    name: 'Tech',
    articles: 12,
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Futuristic-Corridor-Scene-e1748492642808-680x461-17.jpeg',
    href: '#',
  },
];

const TopicCard = ({ topic }: { topic: Topic }) => (
  <Link
    href={topic.href}
    className="group relative block aspect-square overflow-hidden rounded-xl"
  >
    <div>
      <Image
        src={topic.imageUrl}
        alt={topic.name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
      <div className="absolute bottom-0 left-0 p-4 w-full text-white">
        <h3 className="font-display font-bold text-lg leading-tight">{topic.name}</h3>
        <p className="text-sm opacity-80 mt-1">{topic.articles} Articles</p>
      </div>
    </div>
  </Link>
);

const TopTopics = () => {
    return (
      <section className="bg-background">
        <div className="container mx-auto px-5 py-14">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                    <h2 className="font-display text-[28px] font-bold text-foreground leading-none">
                        Top Topics
                    </h2>
                </div>
                <Link
                  href="#"
                  className="flex-shrink-0 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <span className="flex items-center gap-1">
                      <span>View All</span>
                      <ChevronRight className="w-5 h-5" />
                    </span>
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {topicsData.map((topic) => (
                    <TopicCard key={topic.name} topic={topic} />
                ))}
            </div>
        </div>
      </section>
    );
};

export default TopTopics;