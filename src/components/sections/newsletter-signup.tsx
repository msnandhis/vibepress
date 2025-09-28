"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const NewsletterSignup = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/4698728-2.png"
          alt="Newsletter Icon"
          width={50}
          height={50}
          className="mb-6"
        />
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          Subscribe to My Newsletter
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Subscribe to our newsletter to get our newest articles instantly!
        </p>
        <form className="w-full max-w-lg">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Email address"
              className="h-12 flex-grow text-sm"
              aria-label="Email address for newsletter"
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 text-sm font-medium whitespace-nowrap"
            >
              Sign Up Now
            </Button>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm font-normal text-muted-foreground cursor-pointer"
            >
              I consent to the terms and conditions
            </label>
          </div>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSignup;