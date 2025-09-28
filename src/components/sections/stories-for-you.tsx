"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Share2 } from "lucide-react";

type Story = {
  image: string;
  category: string;
  categoryColor: string;
  title: string;
  authorName: string;
  authorImage: string;
  date: string;
  href: string;
};

const stories: Story[] = [
  {
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Futuristic-VR-Experience-1100x733-21.jpeg",
    category: "Active",
    categoryColor: "bg-tag-active",
    title: "Economic Growth Is Essential. So Is Resilience",
    authorName: "Kelly",
    authorImage:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    date: "May 29, 2024",
    href: "#",
  },
  {
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Contemporary-VR-Headsets-Display-e1748496657797-1100x719-22.jpeg",
    category: "Social",
    categoryColor: "bg-tag-social",
    title: "Teachers, Nurses, and Child-Care Workers Have Had Enough",
    authorName: "Kelly",
    authorImage:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    date: "May 29, 2024",
    href: "#",
  },
  {
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Contemporary-Object-Arrangement-1100x829-23.jpeg",
    category: "Inspiration",
    categoryColor: "bg-tag-inspiration",
    title: "Only 57 companies produced 80 percent of global carbon dioxide",
    authorName: "Kelly",
    authorImage:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    date: "May 29, 2024",
    href: "#",
  },
  {
    image:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Futuristic-Encounter-in-Pink-Fog-e1748497317208-24.jpeg",
    category: "Active",
    categoryColor: "bg-tag-active",
    title:
      "How to manage retirement savings with interest rates remaining elevated",
    authorName: "Kelly",
    authorImage:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    date: "May 29, 2024",
    href: "#",
  },
];

const StoryCard = ({ story }: { story: Story }) => {
  return (
    <article
      className="relative h-[470px] rounded-xl overflow-hidden group text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${story.image})` }}
    >
      <Link
        href={story.href}
        className="absolute inset-0 z-10"
        aria-label={story.title}
      ></Link>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all duration-300" />
      <div className="relative z-20 flex flex-col h-full p-6">
        <div className="flex-grow" />

        <div>
          <Link
            href="#"
            className={`${story.categoryColor} text-white text-[11px] font-bold px-2.5 py-1 rounded-[3px] inline-block mb-3 uppercase tracking-wider`}
          >
            {story.category}
          </Link>
          <h3 className="font-display text-xl font-bold leading-tight mb-4">
            <Link href={story.href} className="hover:underline">
              {story.title}
            </Link>
          </h3>
          <div className="flex items-center text-sm text-gray-200">
            <Image
              src={story.authorImage}
              alt={story.authorName}
              width={28}
              height={28}
              className="rounded-full mr-2.5"
            />
            <span className="font-semibold">{story.authorName}</span>
            <span className="mx-1.5">•</span>
            <span>{story.date}</span>
          </div>
        </div>

        <button
          className="absolute bottom-6 right-6 z-30 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-300"
          aria-label="Share"
          onClick={(e) => {
            e.preventDefault();
            console.log("Share clicked");
          }}
        >
          <Share2 size={16} className="text-white" />
        </button>
      </div>
    </article>
  );
};

export default function StoriesForYou() {
  return (
    <section className="container py-16 bg-background">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#EC4899]"></span>
          <h2 className="font-display text-[26px] font-bold text-foreground">
            Stories for you
          </h2>
        </div>
        <Link
          href="#"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>View All</span>
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stories.map((story, index) => (
          <StoryCard key={index} story={story} />
        ))}
      </div>
    </section>
  );
}