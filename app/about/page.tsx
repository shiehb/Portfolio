// app/about/page.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { useLoading } from "@/lib/LoadingContext";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const skills = {
    design: [
        { name: "UI/UX Design", level: 90, icon: "🎨" },
        { name: "Graphic Design", level: 85, icon: "✏️" },
        { name: "Brand Identity", level: 80, icon: "🏷️" },
        { name: "Typography", level: 75, icon: "🔤" },
    ],
    development: [
        { name: "React / Next.js", level: 92, icon: "⚛️" },
        { name: "TypeScript", level: 88, icon: "📘" },
        { name: "Node.js", level: 82, icon: "🟢" },
        { name: "Tailwind CSS", level: 90, icon: "🎨" },
    ],
    media: [
        { name: "Videography", level: 85, icon: "🎥" },
        { name: "Photography", level: 80, icon: "📷" },
        { name: "Editing", level: 88, icon: "✂️" },
        { name: "Color Grading", level: 78, icon: "🎬" },
    ],
};

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

const testimonials = [
    {
        id: 1,
        name: "Sarah Johnson",
        role: "CEO, Creative Agency",
        quote: "Jericho's work is exceptional. He brought our vision to life with stunning design and flawless execution.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Product Manager",
        quote: "A true professional who delivers high-quality work on time. His attention to detail is remarkable.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: 3,
        name: "Emily Rodriguez",
        role: "Brand Director",
        quote: "Working with Jericho was a game-changer for our brand. His creative vision transformed our digital presence.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    },
];

export default function AboutPage() {
    const { setTotalItems, incrementLoaded, resetLoading } = useLoading();
    const hasIncremented = useRef(false);
    const [activeSection, setActiveSection] = useState("skills");
    
    const headerRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const experienceRef = useRef<HTMLDivElement>(null);
    const testimonialsRef = useRef<HTMLDivElement>(null);
    const philosophyRef = useRef<HTMLDivElement>(null);
    const profileImageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        resetLoading();
        setTotalItems(1);

        if (!hasIncremented.current) {
            hasIncremented.current = true;
            incrementLoaded();
        }
    }, [setTotalItems, incrementLoaded, resetLoading]);

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll(".section-anchor");
            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    setActiveSection(section.id);
                }
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

            // Skills section
            if (skillsRef.current) {
                const skillCards = skillsRef.current.querySelectorAll(".skill-card");
                skillCards.forEach((card, index) => {
                    gsap.fromTo(card,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            delay: index * 0.1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 90%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });

                // Skill bars
                const bars = skillsRef.current.querySelectorAll(".skill-bar");
                bars.forEach((bar) => {
                    const targetWidth = bar.getAttribute("data-width") || "0%";
                    gsap.fromTo(bar,
                        { width: "0%" },
                        {
                            width: targetWidth,
                            duration: 1,
                            delay: 0.2,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: bar,
                                start: "top 90%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });
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

            // Testimonials section
            if (testimonialsRef.current) {
                const testimonialCards = testimonialsRef.current.querySelectorAll(".testimonial-card");
                testimonialCards.forEach((card, index) => {
                    gsap.fromTo(card,
                        { opacity: 0, scale: 0.95 },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                            delay: index * 0.1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 90%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });
            }

            // Philosophy section
            if (philosophyRef.current) {
                gsap.fromTo(philosophyRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: philosophyRef.current,
                            start: "top 85%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-screen bg-[#222222] text-white font-display">
            <div ref={headerRef} className="relative py-16 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fd551d]/5 to-transparent" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="block mb-2 md:mb-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#c0c0c0]">
                        GET TO KNOW ME
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] text-white">
                        About
                        <span className="block text-[#fd551d]">Jericho Urbano</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-[#c0c0c0]">
                        Visual Artist & Web Developer crafting immersive digital experiences,
                        cinematic narratives, and meaningful brand identities.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 px-4 pb-8">
                {[
                    { id: "skills", label: "Skills" },
                    { id: "experience", label: "Experience" },
                    { id: "testimonials", label: "Testimonials" },
                    { id: "philosophy", label: "Philosophy" },
                ].map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
                            activeSection === item.id
                                ? "bg-[#fd551d] text-white shadow-lg shadow-[#fd551d]/30"
                                : "bg-zinc-800/50 text-[#c0c0c0] hover:bg-zinc-700/50 hover:text-white"
                        }`}
                    >
                        {item.label}
                    </a>
                ))}
            </div>

            <section className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            Creative Technologist & Visual Artist
                        </h2>
                        <div className="space-y-4 text-[#c0c0c0] text-sm sm:text-base leading-relaxed">
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
                                className="px-6 py-2 bg-[#fd551d] text-white rounded-full text-sm hover:bg-[#fd551d]/80 transition-colors"
                            >
                                View My Work
                            </Link>
                            <Link
                                href="/contact"
                                className="px-6 py-2 border border-white/20 text-white rounded-full text-sm hover:bg-white/10 transition-colors"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </div>

                    <div ref={profileImageRef} className="relative aspect-square max-w-md mx-auto w-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#fd551d]/20 to-transparent rounded-2xl blur-2xl" />
                        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10">
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

            <section id="skills" className="section-anchor max-w-6xl mx-auto px-4 pb-20">
                <div ref={skillsRef}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                        Skills & <span className="text-[#fd551d]">Expertise</span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {Object.entries(skills).map(([category, skillList]) => (
                            <div
                                key={category}
                                className="skill-card bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-[#fd551d]/30 transition-colors"
                            >
                                <h3 className="text-sm uppercase tracking-[0.15em] text-[#fd551d] mb-4">
                                    {category}
                                </h3>
                                <div className="space-y-4">
                                    {skillList.map((skill) => (
                                        <div key={skill.name}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-white flex items-center gap-2">
                                                    <span>{skill.icon}</span>
                                                    {skill.name}
                                                </span>
                                                <span className="text-xs text-[#c0c0c0]">{skill.level}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="skill-bar h-full bg-gradient-to-r from-[#fd551d] to-orange-400 rounded-full"
                                                    data-width={`${skill.level}%`}
                                                    style={{ width: "0%" }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="experience" className="section-anchor max-w-6xl mx-auto px-4 pb-20">
                <div ref={experienceRef}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
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
                                    <div className="absolute left-4 md:left-1/2 top-2 w-4 h-4 bg-[#fd551d] rounded-full border-4 border-[#222222] -translate-x-1/2 z-10" />

                                    <div className={`pl-12 md:pl-0 w-full ${
                                        index % 2 === 0 ? "md:text-right" : "md:text-left"
                                    }`}>
                                        <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-[#fd551d]/30 transition-colors ${
                                            index % 2 === 0 ? "md:mr-6" : "md:ml-6"
                                        }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{exp.icon}</span>
                                                <span className="text-xs text-[#c0c0c0]">{exp.year}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                                            <p className="text-sm text-[#fd551d] mb-2">{exp.company}</p>
                                            <p className="text-sm text-[#c0c0c0]">{exp.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="testimonials" className="section-anchor max-w-6xl mx-auto px-4 pb-20">
                <div ref={testimonialsRef}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                        Testimonials & <span className="text-[#fd551d]">Feedback</span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="testimonial-card bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-[#fd551d]/30 transition-colors"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#fd551d]/30">
                                        <Image
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{testimonial.name}</h4>
                                        <p className="text-xs text-[#c0c0c0]">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[#c0c0c0] italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                <div className="mt-3 text-[#fd551d] text-xs">★★★★★</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="philosophy" className="section-anchor max-w-6xl mx-auto px-4 pb-20">
                <div ref={philosophyRef} className="relative bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border border-zinc-800 rounded-2xl p-8 md:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fd551d]/5 to-transparent" />
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
                            Design <span className="text-[#fd551d]">Philosophy</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-4xl mb-3">🎯</div>
                                <h3 className="text-sm font-bold text-white mb-2">Purpose-Driven</h3>
                                <p className="text-xs text-[#c0c0c0]">
                                    Every design serves a purpose. I create with intention, ensuring
                                    each element contributes to the overall narrative.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-3">✨</div>
                                <h3 className="text-sm font-bold text-white mb-2">Aesthetic Excellence</h3>
                                <p className="text-xs text-[#c0c0c0]">
                                    Beauty and functionality aren&apos;t mutually exclusive. I believe in
                                    creating experiences that are both visually stunning and usable.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-3">🔮</div>
                                <h3 className="text-sm font-bold text-white mb-2">Future-Forward</h3>
                                <p className="text-xs text-[#c0c0c0]">
                                    I embrace emerging technologies and trends, ensuring my work
                                    remains relevant and innovative for years to come.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}