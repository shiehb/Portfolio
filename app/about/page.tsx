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
import { ClipboardList, Megaphone, Video, Camera, Film, FileText } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const experiences = [
    {
        year: "Feb 2026 - May 2026",
        title: "On-The-Job Trainee",
        company: "Police Community Affairs And Development Unit (LUPPO)",
        description: "Managed and audited digital logs, supported community affairs operations, and created tailored informational multimedia content.",
        icon: ClipboardList,
    },
    {
        year: "2024 - Present",
        title: "CIMO Contributor",
        company: "College Information And Marketing Office (CIMO)",
        description: "Designed digital/visual content for official promotions and documented high-profile institutional events for marketing channels.",
        icon: Megaphone,
    },
    {
        year: "Aug 2024 - Jul 2026",
        title: "Chief Multimedia Editor",
        company: "The Louisian Torch",
        description: "Led and mentored a multimedia team in planning, producing, and editing visual content while streamlining review workflows.",
        icon: Video,
    },
    {
        year: "Aug 2024 - Jul 2026",
        title: "Photojournalist",
        company: "The Louisian Torch",
        description: "Captured and edited high-impact photographs for campus news, major events, and feature articles under tight deadlines.",
        icon: Camera,
    },
    {
        year: "Sep 2023 - Jul 2024",
        title: "Multimedia Staffer",
        company: "The Louisian Torch",
        description: "Produced video content for campus news, event recaps, and digital feature stories in collaboration with editors and writers.",
        icon: Film,
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
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>
            </div>

            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-zinc-900">
                            Lorem Ipsum
                        </h2>
                        <div className="space-y-4 text-zinc-700 text-sm sm:text-base leading-relaxed">
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                            <p>
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            </p>
                            <p>
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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
                            <a
                                href="https://shiehb.github.io/link.jerichourbano/files/resume.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                View Resume
                            </a>
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
                            {experiences.map((exp, index) => {
                                const IconComponent = exp.icon;
                                return (
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
                                                    <IconComponent className="w-5 h-5 text-[#fd551d]" />
                                                    <span className="text-xs text-zinc-500 font-semibold tracking-wider">{exp.year}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-zinc-900">{exp.title}</h3>
                                                <p className="text-sm text-[#fd551d] font-medium mb-2">{exp.company}</p>
                                                <p className="text-sm text-zinc-600 leading-relaxed">{exp.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Vignette fader before footer */}
            <SectionVignette />
        </div>
    );
}