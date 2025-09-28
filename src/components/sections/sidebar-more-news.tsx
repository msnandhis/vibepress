import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NewsItem = {
  image: string;
  category: string;
  categoryBgClass: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  } | null;
  date: string;
  url: string;
};

const newsItems: NewsItem[] = [
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Neon-Tropicana-Acrylic-Art-680x453-27.jpeg",
    category: "Business",
    categoryBgClass: "bg-tag-business",
    title: "Recovery and Cleanup in Florida After Hurricane Ian",
    author: {
      name: "Kelly",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    },
    date: "May 24, 2024",
    url: "#",
  },
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Dreamy-Keyboard-Close-Up-200x114-28.jpeg",
    category: "Health",
    categoryBgClass: "bg-tag-health",
    title: "Why Is the Most American Fruit So Hard to Buy?",
    author: null,
    date: "May 24, 2024",
    url: "#",
  },
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Glowing-Microchip-Close-Up-e1748497708787-200x134-29.jpeg",
    category: "Health",
    categoryBgClass: "bg-tag-health",
    title: "Winners of Wildlife Photographer of the Year 2022",
    author: null,
    date: "May 24, 2024",
    url: "#",
  },
];

const SidebarMoreNews = () => {
  return (
    <div className="mb-12">
      <div className="mb-7 border-b border-border pb-4">
        <h3 className="font-display text-xl font-bold text-foreground">
          More News
        </h3>
      </div>
      <div className="space-y-6">
        {newsItems.map((item, index) => (
          <div key={index} className="flex">
            <Link
              href={item.url}
              className="relative block h-[70px] w-[100px] flex-shrink-0"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={100}
                height={70}
                className="h-full w-full rounded-lg object-cover"
              />
              <span
                className={cn(
                  "absolute bottom-2 left-2 z-10 rounded-md px-2 py-0.5 text-[11px] font-medium text-white",
                  item.categoryBgClass
                )}
              >
                {item.category}
              </span>
            </Link>
            <div className="flex-1 pl-5">
              <h3 className="font-display text-sm font-semibold leading-tight text-foreground">
                <Link
                  href={item.url}
                  className="hover:text-primary transition-colors duration-300"
                >
                  {item.title}
                </Link>
              </h3>
              <div className="mt-2 flex items-center text-[11px] text-muted-foreground">
                {item.author && (
                  <>
                    <Link
                      href="#"
                      className="flex items-center hover:text-primary transition-colors duration-300"
                    >
                      <div className="flex items-center">
                        <Image
                          src={item.author.avatar}
                          alt={item.author.name}
                          width={25}
                          height={25}
                          className="mr-2 h-[25px] w-[25px] rounded-full object-cover"
                        />
                        <span className="font-medium text-foreground">{item.author.name}</span>
                      </div>
                    </Link>
                    <span className="mx-1.5 text-muted-foreground/70">·</span>
                  </>
                )}
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarMoreNews;