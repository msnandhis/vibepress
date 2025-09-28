"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const LoadMore = () => {
  const handleClick = () => {
    // Pagination functionality would be handled here
    console.log("Load more clicked");
  };

  return (
    <div className="w-full flex justify-center mt-[30px]">
      <Button
        variant="secondary"
        onClick={handleClick}
        className="h-auto bg-secondary hover:bg-[#e8e8e8] text-foreground font-body text-[13px] font-medium uppercase leading-normal tracking-[0.5px] px-[30px] py-[13px] rounded-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        load more
      </Button>
    </div>
  );
};

export default LoadMore;