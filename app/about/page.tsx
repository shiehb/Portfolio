// app/about/page.tsx
'use client';

import { useEffect, useRef } from "react";
import { triggerPageTransition } from "@/lib/transitionEvents";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionVignette from "@/components/SectionVignette";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const experiences = [
    {
        year: "2023 - Present",
        title: "Senior Web Developer",
        company: "Digital Agency Co.",
        description: "Leading web development projects, creating immersive digital experiences, and mentoring junior developers.",
        icon: "💻",
    },
    {
        year: "2022 - 2023",
        title: "Visual Designer",
        company: "Creative Studio",
        description: "Designed and developed visual identities, websites, and marketing materials for various clients.",
        icon: "🎨",
    },
    {
        year: "2021 - 2022",
        title: "Freelance Developer",
        company: "Self-Employed",
        description: "Worked on various projects including web development, photography, and videography for diverse clients.",
        icon: "🚀",
    },
    {
        year: "2020 - 2021",
        title: "Junior Developer",
        company: "Tech Startup",
        description: "Built responsive websites and web applications using modern JavaScript frameworks.",
        icon: "🌟",
    },
];

export default function AboutPage() {
    const router = useRouter();
    
    const headerRef = useRef<HTMLDivElement>(null);
    const experienceRef = useRef<HTMLDivElement>(null);
    const profileImageRef = useRef<HTMLDivElement>(null);

    const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string, title?: string) => {
        e.preventDefault();
        triggerPageTransition(() => {
            router.push(href);
        }, href, title);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header animation
            if (headerRef.current) {
                gsap.fromTo(headerRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: headerRef.current,
                            start: "top 90%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            }

            // Profile image animation
            if (profileImageRef.current) {
                gsap.fromTo(profileImageRef.current,
                    { opacity: 0, scale: 0.95 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: profileImageRef.current,
                            start: "top 90%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            }

            // Experience section
            if (experienceRef.current) {
                const expItems = experienceRef.current.querySelectorAll(".exp-item");
                expItems.forEach((item, index) => {
                    gsap.fromTo(item,
                        { opacity: 0, x: index % 2 === 0 ? -30 : 30 },
                        {
                            opacity: 1,
                            x: 0,
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: item,
                                start: "top 90%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-screen bg-transparent text-zinc-900 font-display pt-16">
            <div ref={headerRef} className="relative py-16 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fd551d]/5 to-transparent pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="block mb-2 md:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                        GET TO KNOW ME
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] text-zinc-900">
                        About
                        <span className="block text-[#fd551d]">Jericho Urbano</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-zinc-600">
                        Visual Artist & Web Developer crafting immersive digital experiences,
                        cinematic narratives, and meaningful brand identities.
                    </p>
                </div>
            </div>

            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-zinc-900">
                            Creative Technologist & Visual Artist
                        </h2>
                        <div className="space-y-4 text-zinc-700 text-sm sm:text-base leading-relaxed">
                            <p>
                                I am a visual artist and web developer based in the Philippines,
                                specializing in immersive digital experiences, videography, and
                                narrative aesthetics.
                            </p>
                            <p>
                                With a passion for blending technology and artistry, I create
                                high-impact interactive web applications, cinematic narratives,
                                and brand identities that resonate with audiences.
                            </p>
                            <p>
                                My approach combines seamless motion physics, minimalist spatial
                                layouts, and precision color science to deliver experiences that
                                are both visually stunning and functionally robust.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Link
                                href="/projects"
                                onClick={(e) => handleNavigate(e, '/projects', 'PROJECTS')}
                                className="px-6 py-2.5 bg-[#fd551d] text-white rounded-full text-sm font-semibold hover:bg-[#e04815] transition-all shadow-md shadow-[#fd551d]/20 hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                View My Work
                            </Link>
                            <Link
                                href="/contact"
                                onClick={(e) => handleNavigate(e, '/contact', 'CONTACT')}
                                className="px-6 py-2.5 bg-white/80 border border-zinc-300 text-zinc-800 rounded-full text-sm font-semibold hover:bg-zinc-100 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </div>

                    <div ref={profileImageRef} className="relative aspect-square max-w-md mx-auto w-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#fd551d]/15 to-transparent rounded-2xl blur-xl" />
                        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-zinc-200/80 shadow-lg bg-zinc-100">
                            <Image
                                src="/img/hero.webp"
                                alt="Jericho Urbano"
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 400px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section id="experience" className="section-anchor max-w-6xl mx-auto px-4 pb-20">
                <div ref={experienceRef}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-zinc-900">
                        Experience <span className="text-[#fd551d]">Journey</span>
                    </h2>

                    <div className="relative">
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#fd551d]/30 -translate-x-1/2" />

                        <div className="space-y-8">
                            {experiences.map((exp, index) => (
                                <div
                                    key={index}
                                    className={`exp-item relative flex flex-col md:flex-row items-start gap-6 ${
                                        index % 2 === 0 ? "md:pr-[50%]" : "md:pl-[50%] md:flex-row-reverse"
                                    }`}
                                >
                                    <div className="absolute left-4 md:left-1/2 top-2 w-4 h-4 bg-[#fd551d] rounded-full border-4 border-white shadow-sm -translate-x-1/2 z-10" />

                                    <div className={`pl-12 md:pl-0 w-full ${
                                        index % 2 === 0 ? "md:text-right" : "md:text-left"
                                    }`}>
                                        <div className={`bg-white/85 backdrop-blur-sm border border-zinc-200/90 rounded-xl p-6 shadow-sm hover:border-[#fd551d]/40 transition-all duration-300 ${
                                            index % 2 === 0 ? "md:mr-6" : "md:ml-6"
                                        }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{exp.icon}</span>
                                                <span className="text-xs text-zinc-500 font-semibold tracking-wider">{exp.year}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900">{exp.title}</h3>
                                            <p className="text-sm text-[#fd551d] font-medium mb-2">{exp.company}</p>
                                            <p className="text-sm text-zinc-600 leading-relaxed">{exp.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Vignette fader before footer */}
            <SectionVignette />
        </div>
    );
}