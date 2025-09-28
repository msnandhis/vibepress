import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import SidebarSocial from "@/components/sections/sidebar-social";
import SidebarMoreNews from "@/components/sections/sidebar-more-news";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentsSection } from '@/components/blog/comments-section';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Comment {
  id: number;
  content: string;
  status: "pending" | "approved" | "spam";
  author: { name: string; avatar?: string };
  createdAt: Date;
  replies?: Comment[];
}

const blogPosts = {
  "brain-study-identifies-a-cost-of-caregiving-for-new-fathers": {
    title: "Brain study identifies a cost of caregiving for new fathers",
    excerpt: "Parenting makes the heart grow fonder, and the brain grow … smaller? Several studies have revealed that the brain loses volume across the transition to parenthood. But researchers like me are still figuring out what these changes mean for parents.",
    author: {
      name: "Darby Saxbe",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg",
    },
    date: "May 9, 2024",
    category: "Health",
    content: `
      <p>Parenting makes the heart grow fonder, and the brain grow … smaller? Several studies have revealed that the brain loses volume across the transition to parenthood. But researchers like me are still figuring out what these changes mean for parents.</p>
      
      <p>In a new study that looked at brain change in first-time fathers, my colleagues and I found that brain volume loss was linked with more engagement in parenting but also more sleep problems and mental health symptoms. These results might point to a cost of caregiving, traditionally shouldered by women but increasingly borne by men also.</p>
      
      <h2>Brain changes for mom come with new baby</h2>
      
      <p>Caring for an infant demands new motivations and skills, so it is no surprise that it might also sculpt the brain. Research in rodents first identified remodeling of both the structure and function of the brain during pregnancy and parenthood. A new body of research is unearthing similar effects in human parents, too.</p>
      
      <p>In a pair of studies, researchers recruited first-time mothers for a brain scan that occurred before they became pregnant and then scanned them again a few months after birth. Gray matter – the layer of brain tissue that contains neuronal cell bodies – shrank in the mothers but not in a comparison group of women who did not become mothers.</p>
      
      <p>Although a shrinking brain sounds bad, researchers theorized that this more streamlined brain could be adaptive, helping process social information more efficiently and therefore facilitating sensitive caregiving. In keeping with this hypothesis, studies have linked maternal brain changes with women's degree of attachment to infants and with their responses to images of their own infant's face.</p>
      
      <p>Brain changes in fathers have been harder to study. It takes longer to recruit fathers, who are less likely to participate in research on the transition to parenthood. Moreover, fathers don't experience pregnancy or hormonal changes, so researchers have theorized that fathers' brain changes might be slower and subtler than mothers'.</p>
      
      <h2>What we learned from fathers' brains</h2>
      
      <p>To explore this question, my colleagues and I recruited 38 first-time fathers in Southern California, whose partners were in the third trimester of pregnancy, to participate in a longitudinal study.</p>
      
      <p>Each father received two MRI scans: one during his partner's pregnancy and the second about six months after his infant was born. Between the prenatal and postpartum scans, fathers completed surveys about their mental health, sleep and parenting experiences.</p>
      
      <p>We found that fathers lost an average of 2% of their gray matter volume over this period – similar in magnitude to the 2% to 4% decreases observed in new mothers. The volume losses were widespread across the cortex, the brain's wrinkly surface, but did not extend to deeper, subcortical brain areas.</p>
      
      <p>These changes in brain structure predicted fathers' experiences as parents. Fathers who lost more gray matter volume tended to:</p>
      
      <ul>
        <li>report stronger prenatal bonding with the unborn baby and planned to take more time off from work after birth;</li>
        <li>report stronger bonding with the baby after birth, lower parenting stress and more time spent with the infant; and</li>
        <li>experience more postpartum sleep problems, depression, anxiety and overall psychological distress, controlling for prenatal sleep and mental health.</li>
      </ul>
      
      <p>These findings point to a paradox of fatherhood. On the one hand, new fathers' brains appear to adapt to the demands of parenting. On the other hand, these same brain changes predict sleep problems and mental health symptoms.</p>
      
      <h2>Evolution at work?</h2>
      
      <p>Why might fatherhood cost the brain? One explanation is that it takes energy to rewire the brain. Brain tissue is metabolically expensive – in other words, it requires a lot of calories to function.</p>
      
      <p>Another possibility is that the volume losses reflect evolutionary pressures to prioritize social information. Human infants are born extremely underdeveloped compared with the young of other primates and require years of intensive parenting. Over evolutionary time, the human brain has reprioritized social processing over other types of cognition, such as spatial navigation or tool use, to support child-rearing.</p>
      
      <p>Our study couldn't test these evolutionary explanations, but they suggest that the brain changes we observed might come at a cost. In keeping with this hypothesis, we found that the volume losses predicted more sleep problems and mental health symptoms.</p>
      
      <p>These mental health findings are particularly concerning given the high rates of paternal postpartum depression. Globally, an estimated 10% of new fathers experience postpartum depression.</p>
      
      <h2>Time will tell</h2>
      
      <p>The fathers in our study were generally well-educated, financially stable and married or partnered, so our findings may not generalize to more diverse samples. Moreover, we only measured fathers' brains at two time points. It will be important for future research to track fathers' brains over longer periods of time – for example, to determine whether the volume losses rebound after the first year of fatherhood or whether they persist.</p>
      
      <p>Our study joins a growing literature on how the transition to parenthood affects the paternal brain and, by extension, the whole family. As more men take on primary or even solo caregiving roles, it will become increasingly important to understand the biological costs and benefits of fatherhood.</p>
    `,
    featuredImage: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/09933583-8014-4369-931a-d462f8acb42e/generated_images/a-realistic-photograph-of-a-thoughtful-n-fc143470-20250927062946.jpg",
    categoryBgClass: "bg-orange-500", // For health category
  },
};

interface BlogPost {
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  category: string;
  content: string;
  featuredImage: string;
  categoryBgClass: string;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: postSlug } = await params;

  // Use mock data for now
  const postData = blogPosts[postSlug as keyof typeof blogPosts];

  if (!postData) {
    notFound();
  }

  const post: BlogPost = {
    title: postData.title,
    excerpt: postData.excerpt,
    author: postData.author,
    date: postData.date,
    category: postData.category,
    content: postData.content,
    featuredImage: postData.featuredImage,
    categoryBgClass: postData.categoryBgClass,
  };

  // Mock comments for now
  const initialComments: Comment[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            {/* Breadcrumbs */}
            <nav className="mb-6 text-sm text-muted-foreground">
              <ol className="flex items-center space-x-1">
                <li>
                  <Link href="/" className="hover:text-foreground hover:underline">
                    Home
                  </Link>
                </li>
                <li className="mx-1">/</li>
                <li>
                  <Link href="/blog" className="hover:text-foreground hover:underline">
                    Blog
                  </Link>
                </li>
                <li className="mx-1">/</li>
                <li className="text-foreground">{post.title}</li>
              </ol>
            </nav>
            
            {/* Title and Meta */}
            <header className="mb-8">
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <span className="font-semibold text-foreground">{post.author.name}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={post.date}>{post.date}</time>
                  <span className="mx-2">•</span>
                  <span>5 min read</span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground max-w-3xl mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            </header>
            
            {/* Featured Image */}
            <div className="relative mb-8">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={600}
                className="w-full h-96 object-cover rounded-lg"
              />
              
              {/* Category Tag */}
              <div className="absolute top-4 left-4">
                <span className={`${post.categoryBgClass} text-white text-xs font-medium px-3 py-1.5 rounded-md`}>
                  {post.category}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div
                className="text-foreground [&>h1]:text-foreground [&>h2]:text-foreground [&>h3]:text-foreground [&>h4]:text-foreground [&>p]:text-foreground [&>ul]:text-foreground [&>ol]:text-foreground [&>li]:text-foreground [&>blockquote]:text-muted-foreground [&>code]:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
          
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-6 border-b border-border pb-4">
                  Follow Us
                </h3>
                <SidebarSocial />
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-display text-xl font-bold text-foreground mb-6 border-b border-border pb-4">
                  Related Articles
                </h3>
                <SidebarMoreNews />
              </div>
            </div>
          </aside>
        </div>

        <Separator className="my-12" />
        <CommentsSection postId={1} initialComments={initialComments} />
        <div className="mt-12 flex justify-between">
          <Link
            href="/blog"
            className="flex items-center text-primary hover:underline">
            <span className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to blog
            </span>
          </Link>
          <Button variant="outline">Share this post</Button>
        </div>
      </div>
    </div>
  );
}