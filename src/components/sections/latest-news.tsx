"use client";

import Image from "next/image";
import { ChevronRight, Play } from "lucide-react";
import React, { useState } from 'react'

type Article = {
  image: string;
  badge?: string;
  category: string;
  categorySlug: 'business' | 'social' | 'tech' | 'active' | 'health' | 'inspiration';
  title: string;
  excerpt: string;
  author: {
    avatar: string;
    name: string;
  };
  date: string;
  videoIcon?: boolean;
};

const articlesData: Article[] = [
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Modern-Computer-Mouse-on-Beige-Background-680x389-4.jpeg",
    badge: "81%",
    category: "Business",
    categorySlug: "business",
    title: "Splurge or Save Last Minute Pampering Gift Ideas",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
      name: "Kelly",
    },
    date: "May 29, 2024",
  },
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Modern-Industrial-Design-e1748496637393-680x434-5.jpeg",
    category: "Business",
    categorySlug: "business",
    title: "Brain study identifies a cost of caregiving for new fathers",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
      name: "Kelly",
    },
    date: "May 26, 2024",
  },
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Modern-Workspace-Setup-680x453-25.jpeg",
    category: "Social",
    categorySlug: "social",
    title: "Winners of the 2022 Nature Conservancy Photo Contest",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
      name: "Kelly",
    },
    date: "May 26, 2024",
  },
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Vintage-Style-Radio-680x512-6.jpeg",
    category: "Business",
    categorySlug: "business",
    title: "Five Quotes For Some Extra Monday Motivation",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
      name: "Kelly",
    },
    date: "May 26, 2024",
  },
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Pastel-Retro-Synthesizer-e1748496594646-680x458-26.jpeg",
    category: "Tech",
    categorySlug: "tech",
    title: "10 Ways To Reduce Motion Sickness When Using VR",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
      name: "Kelly",
    },
    date: "May 26, 2024",
  },
  {
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Smartwatch-on-Bicycle-Handlebar-680x389-7.jpeg",
    category: "Business",
    categorySlug: "business",
    title: "The ONLY Graphic Design Tutorial You'll Ever Need!",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful, crystal-clear...",
    author: {
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
      name: "Kelly",
    },
    date: "May 26, 2024",
    videoIcon: true,
  },
];

const categoryColors: Record<Article['categorySlug'], string> = {
  business: 'bg-tag-business',
  social: 'bg-tag-social',
  tech: 'bg-tag-tech',
  active: 'bg-tag-active',
  health: 'bg-tag-health',
  inspiration: 'bg-tag-inspiration',
};

const ArticleCard = ({ article }: { article: Article }) => (
  <article className="bg-card rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] p-4 group">
    <div className="flex flex-col md:flex-row md:items-start gap-5">
      <div className="relative w-full md:w-[255px] h-[225px] flex-shrink-0">
        <a href="#" className="block w-full h-full">
          <Image
            src={article.image}
            alt={article.title}
            width={255}
            height={225}
            className="w-full h-full object-cover rounded-lg"
          />
        </a>
        {article.badge && (
          <div 
            className="absolute top-3 right-3 bg-black text-percentage-badge text-[10px] font-bold h-7 w-7 flex items-center justify-center rounded-full"
            style={{ lineHeight: "1" }}
          >
            {article.badge}
          </div>
        )}
        {article.videoIcon && (
          <a href="#" className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full">
                <Play className="text-white fill-white w-5 h-5" />
            </div>
          </a>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <a href="#" className={`${categoryColors[article.categorySlug]} text-white text-[11px] font-medium px-2 py-0.5 rounded-[4px] self-start`}>
          {article.category}
        </a>
        
        <h3 className="font-display text-[1.125rem] leading-[1.4] font-bold text-foreground mt-2 mb-2.5 group-hover:text-primary transition-colors duration-300">
          <a href="#">{article.title}</a>
        </h3>

        <p className="text-muted-foreground text-sm leading-[1.6] mb-4 font-body">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-2 mt-auto pt-2">
            <a href="#">
                <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                />
            </a>
            <div className="text-xs">
                <a href="#" className="font-medium text-foreground hover:text-primary transition-colors duration-300">
                    {article.author.name}
                </a>
                <span className="text-muted-foreground mx-1.5">·</span>
                <span className="text-muted-foreground">{article.date}</span>
            </div>
        </div>
      </div>
    </div>
  </article>
);


export default function LatestNews() {
  const [visibleCount, setVisibleCount] = useState(6);

  const handleLoadMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // In a real app, this would fetch more data.
    // For this static clone, we just increment the visible count.
    setVisibleCount(prevCount => prevCount + 6);
  };

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Latest News
            </h2>
          </div>
          <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground group">
            <span>View All</span>
            <div className="w-5 h-5 bg-foreground rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </a>
        </div>
        
        <div className="grid grid-cols-1 gap-y-6">
          {articlesData.slice(0, visibleCount).map((article, index) => (
            <ArticleCard key={index} article={article} />
          ))}
        </div>
        
        {visibleCount < articlesData.length && (
            <div className="text-center mt-10">
                <a
                href="#"
                onClick={handleLoadMore}
                className="inline-block bg-background text-foreground font-medium px-6 py-3 rounded-lg hover:bg-accent transition-colors text-sm"
                >
                Load More
                </a>
            </div>
        )}
      </div>
    </section>
  );
}