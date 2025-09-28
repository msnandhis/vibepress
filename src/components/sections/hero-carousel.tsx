"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slidesData = [
  {
    category: "Health",
    title: "Brain study identifies a cost of caregiving for new fathers",
    excerpt: "Parenting makes the heart grow fonder, and the brain grow … smaller? Several studies have revealed that the brain loses volume across the transition to parenthood.",
    author: {
      name: "Darby Saxbe",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    },
    date: "May 9, 2024",
    link: "/blog/brain-study-identifies-a-cost-of-caregiving-for-new-fathers",
    backgroundImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/09933583-8014-4369-931a-d462f8acb42e/generated_images/a-realistic-photograph-of-a-thoughtful-n-fc143470-20250927062946.jpg",
    categoryBgClass: "bg-orange-500",
  },
  {
    category: "Tech",
    title: "10 Unconventional Travel Destinations You Must Explore",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful,...",
    author: {
      name: "Kelly",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    },
    date: "June 5, 2024",
    link: "#",
    backgroundImage: "https://jellywp.com/wp/vibepress7/wp-content/uploads/sites/21/2025/05/Vintage-Computer-on-Beige-Background.jpeg",
    categoryBgClass: "bg-primary",
  },
  {
    category: "Tech",
    title: "The Art of Mindfulness: Finding Peace in a Chaotic World",
    excerpt: "What's made Amazon shoppers fall in love with Tozos? Superior audio quality, of course, courtesy of 6-millimeter speaker drivers that produce powerful,...",
    author: {
      name: "Kelly",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    },
    date: "June 5, 2024",
    link: "#",
    backgroundImage: "https://jellywp.com/wp/vibepress7/wp-content/uploads/sites/21/2025/05/Young-Woman-with-Gold-Rimmed-Sunglasses.jpeg",
    categoryBgClass: "bg-primary",
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="container max-w-[1240px] mx-auto px-5 mb-10">
      <div className="relative overflow-hidden rounded-2xl h-[530px]">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slidesData.map((slide, index) => (
            <div key={index} className="relative h-full w-full flex-shrink-0">
              <Image
                src={slide.backgroundImage}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 60%, rgba(0, 0, 0, 0) 100%)',
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-14 text-white">
                <div className="max-w-xl">
                  <Link
                    href={slide.link}
                    className={`${slide.categoryBgClass} text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md`}
                  >
                    {slide.category}
                  </Link>
                  <h2 className="font-display text-4xl lg:text-5xl font-bold mt-5 leading-tight">
                    <Link href={slide.link}>{slide.title}</Link>
                  </h2>
                  <p className="mt-4 text-gray-200 text-lg font-body max-w-lg">
                    {slide.excerpt}
                  </p>
                  <div className="flex items-center mt-6 text-sm">
                    <Image
                      src={slide.author.avatar}
                      alt={slide.author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-3">
                      <span className="font-semibold">{slide.author.name}</span>
                      <span className="text-gray-300 mx-1">·</span>
                      <span className="text-gray-300">{slide.date}</span>
                    </div>
                  </div>
                  <Link
                    href={slide.link}
                    className="mt-8 inline-block bg-white text-gray-900 font-medium py-3 px-6 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    Continue Reading
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-6 right-6 flex items-center space-x-2">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="absolute bottom-8 right-8 flex items-center space-x-2">
            {slidesData.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-colors ${
                        currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                    }`}
                />
            ))}
        </div>
      </div>
    </section>
  );
}