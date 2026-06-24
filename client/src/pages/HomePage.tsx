import { CategoriesSection } from "../components/home/CategoriesSection";
import { FeaturedProductsSection } from "../components/home/FeaturedProductsSection";
import { HeroSection } from "../components/home/HeroSection";
import { NewsletterSection } from "../components/home/NewsletterSection";

export const HomePage = () => {
    return (
        <>
            <HeroSection />
            <CategoriesSection />
            <FeaturedProductsSection />
            <NewsletterSection />
        </>
    );
};
