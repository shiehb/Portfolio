'use client';

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const projectImages = [
    "https://assets.codepen.io/16327/quentin.png",
    "https://assets.codepen.io/16327/planetono.png",
    "https://assets.codepen.io/16327/sanrita.jpg",
    "https://assets.codepen.io/16327/anima.jpg",
    "https://assets.codepen.io/16327/giulio.jpg",
    "https://assets.codepen.io/16327/lando.png",
    "https://assets.codepen.io/16327/glenn.png",
    "https://assets.codepen.io/16327/fantik.jpg",
    "https://assets.codepen.io/16327/romei.jpg",
    "https://assets.codepen.io/16327/ironhill.jpeg",
    "https://assets.codepen.io/16327/inkwell.jpg",
    "https://assets.codepen.io/16327/monolith.jpg",
    "https://assets.codepen.io/16327/phantom.jpg",
    "https://assets.codepen.io/16327/ribbit.jpg",
    "https://assets.codepen.io/16327/aurel.jpg",
    "https://assets.codepen.io/16327/aether.jpg",
    "https://assets.codepen.io/16327/cashapp.jpg",
    "https://assets.codepen.io/16327/osmo.png",
    "https://assets.codepen.io/16327/pantheon.jpg",
    "https://assets.codepen.io/16327/ponpon.jpg",
];

export default function Projects() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.fromTo(
                    headerRef.current.children,
                    { y: 45, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.15,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: headerRef.current,
                            start: "top 85%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            }

            const batchElements = document.querySelectorAll(".batch-image");
            if (batchElements.length > 0) {
                ScrollTrigger.batch(".batch-image", {
                    onEnter: (batch) =>
                        gsap.fromTo(
                            batch,
                            { autoAlpha: 0, y: 55, scale: 0.92 },
                            {
                                autoAlpha: 1,
                                y: 0,
                                scale: 1,
                                stagger: 0.08,
                                duration: 0.8,
                                ease: "power3.out",
                                overwrite: "auto",
                            }
                        ),
                });
            }

            const images = gsap.utils.toArray<HTMLElement>(".project-img-inner");
            images.forEach((img) => {
                const parent = img.parentElement;
                if (parent) {
                    gsap.fromTo(
                        img,
                        { scale: 1.25 },
                        {
                            scale: 1.0,
                            ease: "none",
                            scrollTrigger: {
                                trigger: parent,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: true,
                            },
                        }
                    );
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="relative z-10 py-4 px-3 sm:px-6 bg-white min-h-screen text-zinc-900 font-display"
        >
            <div ref={headerRef} className="text-center max-w-[560px] mx-auto my-2">
                <h1 className="font-normal text-[clamp(1.3rem,3vw,1.8rem)] mb-3 tracking-[0.05em] uppercase text-zinc-900 font-display">
                    PROJECTS
                </h1>
                <p className="text-sm text-[#fd551d] leading-relaxed font-display">
                    Explore my web design and media projects
                </p>
            </div>

            <div className="max-w-[1280px] mx-auto w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {projectImages.map((src, index) => (
                    <div
                        key={index}
                        className="batch-image opacity-0 invisible w-full aspect-[16/9] relative overflow-hidden will-change-transform shadow-sm group rounded-sm"
                    >
                        <div className="project-img-inner w-full h-full relative overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105">
                            <Image
                                src={src}
                                alt={`Project artwork ${index + 1}`}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}