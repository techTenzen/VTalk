import { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Home,
    Users,
    Newspaper,
    Flame,
    Code,
    Lightbulb,
    Star,
    Camera,
    Music,
    Film,
    Gamepad,
    Heart,
    Coffee,
    ChevronRight,
    BookOpen,
    Sparkles,
    Trophy,
    Radio,
    Cpu, MessageCircle, School, PlusCircle
} from 'lucide-react';

interface SidebarProps {
    onCreatePostClick: () => void;
    isMobile?: boolean;
    onCloseMobile?: () => void;
}

export function Sidebar({ onCreatePostClick, isMobile = false, onCloseMobile }: SidebarProps) {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    // Map category icons to Lucide React components
    const iconMap = {
        'all-posts': Home,
        'technology': Cpu,
        'gaming': Gamepad,
        'movies': Film,
        'music': Music,
        'media-station': Radio,
        'gossips': MessageCircle,
        'campus-tour': School,
        'create-post': PlusCircle
    };


    // Helper function to get icon component
    const getIcon = (iconName: string) => {
        const IconComponent = iconMap[iconName] || Home;
        return <IconComponent className="w-5 h-5 mr-3 transition-transform duration-300 ease-in-out" />;
    };

    // Animation variants
    const sidebarVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    return (
        <motion.aside
            className={`${isMobile ? 'w-full' : 'md:w-64 lg:w-72 flex-shrink-0'} pt-4 md:h-screen-minus-header md:sticky md:top-16 overflow-hidden`}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.nav className="space-y-1 mb-6 px-2">
                {CATEGORIES.map((category, index) => {
                    const [isActive] = useRoute(category.id === 'all' ? '/' : `/${category.id}`);
                    const isHovered = hoveredCategory === category.id;

                    return (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            onHoverStart={() => setHoveredCategory(category.id)}
                            onHoverEnd={() => setHoveredCategory(null)}
                            className="relative"
                        >
                            <Link
                                href={category.id === 'all' ? '/' : `/${category.id}`}
                                onClick={isMobile && onCloseMobile ? onCloseMobile : undefined}
                            >
                                <motion.a
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg group transition-all duration-300 ${
                                        isActive
                                            ? 'bg-secondary/80 text-foreground'
                                            : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                                    }`}
                                    whileHover={{
                                        x: 4,
                                        backgroundColor: isActive ? undefined : "rgba(var(--secondary), 0.15)"
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    <div className="flex items-center">
                                        <motion.div
                                            className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors duration-300`}
                                            whileHover={{ rotate: isActive ? 0 : 5 }}
                                            animate={{ scale: isActive ? 1.1 : 1 }}
                                        >
                                            {getIcon(category.icon)}
                                        </motion.div>
                                        <span className="font-medium">{category.name}</span>
                                    </div>

                                    <AnimatePresence>
                                        {(isHovered || isActive) && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.a>
                            </Link>

                            {isActive && (
                                <motion.div
                                    className="absolute left-0 top-1/2 w-1 h-8 bg-primary rounded-r-full transform -translate-y-1/2"
                                    layoutId="activeIndicator"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </motion.nav>

            <motion.div
                className="border-t border-border pt-4 pb-8 px-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                >
                    <Button
                        className="w-full relative overflow-hidden group transition-all duration-300"
                        onClick={onCreatePostClick}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                        />

                        <motion.div
                            className="relative flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <motion.div
                                initial={{ rotate: 0 }}
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                            </motion.div>
                            <span>Create Post</span>
                        </motion.div>
                    </Button>
                </motion.div>
            </motion.div>
        </motion.aside>
    );
}